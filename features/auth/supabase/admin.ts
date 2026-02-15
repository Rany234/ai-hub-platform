import { createClient } from "@supabase/supabase-js";

// 创建拥有 Service Role 权限的 Admin 客户端
// 注意：此客户端仅限在服务端代码中使用 (Server Actions / Route Handlers)
export const createSupabaseAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    // 在构建阶段，如果没有环境变量，允许返回 null 或抛出非阻塞错误
    // 但为了运行时安全，最好检查
    console.warn("Missing Supabase env vars for Admin Client");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
