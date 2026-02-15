import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";
import { MessageCircle } from "lucide-react";

export default async function ChatPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/chat");
  }

  return (
    <DashboardPlaceholder
      title="聊天功能即将上线"
      description="我们正在将系统全面升级为服务市场模式。聊天功能正在重构中，敬请期待。"
      type="coming-soon"
      icon={MessageCircle}
    />
  );
}
