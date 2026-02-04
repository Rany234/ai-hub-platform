"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Code2, Loader2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserRole } from "@/app/actions/profile";

type Role = "client" | "freelancer";

export default function OnboardingRolePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleSelect = (role: Role) => {
    if (isPending) return;

    setSelectedRole(role);

    startTransition(async () => {
      try {
        const result = await updateUserRole(role);

        if (result && result.success) {
          router.push("/dashboard");
          router.refresh();
        }
      } catch (e) {
        console.error("Failed to update role:", e);
        setSelectedRole(null);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {isPending ? (
        <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            正在保存身份...
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">选择你的身份</h1>
          <p className="mt-2 text-muted-foreground">请选择你在平台上的主要角色</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            role="button"
            tabIndex={0}
            aria-disabled={isPending}
            onClick={() => handleSelect("client")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelect("client");
            }}
            className={isPending ? "pointer-events-none" : undefined}
          >
            <Card
              className={
                "cursor-pointer hover:border-primary hover:shadow-lg transition-all " +
                (selectedRole === "client" ? "border-primary" : "")
              }
            >
              <CardHeader className="text-center">
                <Briefcase className="w-12 h-12 mx-auto text-primary" />
                <CardTitle>我是雇主</CardTitle>
                <CardDescription>I want to hire</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">发布任务，雇佣开发者，管理项目</p>
              </CardContent>
            </Card>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-disabled={isPending}
            onClick={() => handleSelect("freelancer")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleSelect("freelancer");
            }}
            className={isPending ? "pointer-events-none" : undefined}
          >
            <Card
              className={
                "cursor-pointer hover:border-primary hover:shadow-lg transition-all " +
                (selectedRole === "freelancer" ? "border-primary" : "")
              }
            >
              <CardHeader className="text-center">
                <Code2 className="w-12 h-12 mx-auto text-primary" />
                <CardTitle>我是开发者</CardTitle>
                <CardDescription>I want to work</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">接单任务，展示技能，赚取收入</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
