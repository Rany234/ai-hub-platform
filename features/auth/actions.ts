"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { signIn, signOut } from "@/auth";
import prisma from "@/lib/prisma";
import type { ActionResult } from "@/types/actions";
import bcrypt from "bcryptjs";
import { loginSchema, signUpSchema } from "./schemas";

type LoginResult = ActionResult<null> & { redirectTo?: string };

type SignUpInputs = {
  email?: string;
  username?: string;
  fullName?: string;
};

type SignUpResult =
  | { success: true; data: any; redirectTo?: string; inputs?: SignUpInputs }
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

export async function loginAction(
  _prevState: unknown,
  formData: FormData
): Promise<LoginResult> {
  try {
    const input = loginSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    try {
      await signIn("credentials", {
        email: input.email,
        password: input.password,
        redirect: false,
      });
    } catch (error: any) {
      if (error.type === "CredentialsSignin") {
        return { success: false, error: "账号或密码错误" };
      }
      return { success: false, error: "登录发生异常，请稍后重试" };
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
    await signOut({ redirect: false });
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

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      return { success: false, error: "该邮箱已被注册", inputs };
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.fullName || input.username,
        username: input.username,
        fullName: input.fullName,
        emailVerified: new Date(),
      },
    });

    revalidatePath("/", "layout");
    return { success: true, data: { id: user.id }, redirectTo: "/dashboard", inputs };
  } catch (e) {
    console.error("SIGNUP_ERROR:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "注册服务暂时不可用，请稍后重试",
      inputs,
    };
  }
}

export async function resendVerificationAction(_email: string): Promise<ActionResult<null>> {
  return { success: false, error: "当前模式下已自动验证邮箱，无需重发" };
}

export async function loginAndRedirectAction(formData: FormData): Promise<never> {
  const result = await loginAction(null, formData);
  if (!result.success) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }
  redirect(result.redirectTo ?? "/dashboard");
}
