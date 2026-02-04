import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export default async function WelcomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-6 px-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">账号激活成功！</h1>

        <p className="text-gray-600">
          欢迎加入 智汇 AI-Hub，您的账户已准备就绪。
        </p>

        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md bg-black text-white px-8 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
        >
          进入工作台
        </a>
      </div>
    </div>
  );
}
