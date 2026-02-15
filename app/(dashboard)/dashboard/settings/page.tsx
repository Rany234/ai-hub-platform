import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { SettingsFormClient } from "./settings-form-client";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/settings");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true },
  });

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/settings");
  }

  const initialProfile = {
    id: user.id,
    username: null,
    full_name: user.name ?? null,
    bio: null,
    website: null,
    avatar_url: user.image ?? null,
    email: user.email ?? null,
    wechat_id: null,
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">用户设置</h1>
      <p className="mt-2 text-sm text-muted-foreground">更新你的个人资料与头像。</p>

      <div className="mt-6">
        <SettingsFormClient userId={user.id} initialProfile={initialProfile as any} />
      </div>
    </div>
  );
}
