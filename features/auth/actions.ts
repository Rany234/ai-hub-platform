"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "./supabase/server";
import { loginSchema, signUpSchema } from "./schemas";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

type LoginResult = ActionResult<null> & { redirectTo?: string };

type SignUpInputs = {
  email?: string;
  username?: string;
  fullName?: string;
};

type SignUpResult =
  | { success: true; data: null; redirectTo?: string; inputs?: SignUpInputs; requireVerification?: boolean }
  | { success: false; error: string; inputs?: SignUpInputs };

function getString(formData: FormData, key: string): string | undefined {
  const v = formData.get(key);
  return typeof v === "string" ? v : undefined;
}

function pickSignUpInputs(formData: FormData): SignUpInputs {
  return {
    email: getString(formData, "email"),
    username: getString(formData, "username"),
    fullName: getString(formData, "fullName"),
  };
}

function mapSupabaseErrorToChinese(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("security purposes") || m.includes("rate limit")) {
    return "操作太频繁，请稍后再试";
  }

  if (m.includes("already registered") || m.includes("unique constraint")) {
    return "该邮箱/用户名已被注册";
  }

  if (m.includes("invalid login credentials")) {
    return "账号或密码错误";
  }

  // Unknown errors: unmask raw message for debugging
  return `注册失败: ${message}`;
}

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<LoginResult> {
  try {
    const input = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) {
      return { success: false, error: "账号或密码错误" };
    }

    revalidatePath("/", "layout");
    return { success: true, data: null, redirectTo: "/dashboard" };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "登录失败",
    };
  }
}

export async function logoutAction(): Promise<ActionResult<null>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };

    revalidatePath("/", "layout");
    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "退出登录失败" };
  }
}

export async function signUpAction(
  _prevState: unknown,
  formData: FormData
): Promise<SignUpResult> {
  const inputs = pickSignUpInputs(formData);

  try {
    const input = signUpSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      username: formData.get("username"),
      fullName: formData.get("fullName"),
    });

    const supabase = await createSupabaseServerClient();

    const origin = (await headers()).get("origin");
    const callbackUrl = origin
      ? `${origin}/auth/callback`
      : "https://ai-hub-platform.vercel.app/auth/callback";

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });

    if (error) {
      return { success: false, error: mapSupabaseErrorToChinese(error.message), inputs };
    }

    const userId = data.user?.id;
    if (userId) {
      const { error: profileErr } = await supabase.from("profiles").upsert({
        id: userId,
        username: input.username ?? null,
        full_name: input.fullName ?? null,
      });

      if (profileErr) {
        // Intentionally swallow to keep sign-up UX stable.
      }
    }

    // If email verification is enabled, Supabase may return no session.
    if (!data.session) {
      return { success: true, data: null, requireVerification: true, inputs };
    }

    revalidatePath("/", "layout");
    return { success: true, data: null, redirectTo: "/dashboard", inputs };
  } catch (e) {
    const msg = e instanceof Error ? e.message : undefined;

    if (msg) {
      return { success: false, error: mapSupabaseErrorToChinese(msg), inputs };
    }

    return { success: false, error: "注册服务暂时不可用，请稍后重试", inputs };
  }
}

export async function loginAndRedirectAction(formData: FormData): Promise<never> {
  const result = await loginAction(null, formData);
  if (!result.success) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }
  redirect(result.redirectTo ?? "/dashboard");
}
