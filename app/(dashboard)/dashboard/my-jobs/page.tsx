import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function MyJobsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/my-jobs");
  }

  // 统一重定向到新的工作台路由
  redirect("/dashboard/workbench");
}
