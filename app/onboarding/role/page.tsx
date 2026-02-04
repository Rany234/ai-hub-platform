import { Briefcase, Code2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserRole, UserRole } from "@/actions/profile";

export default function OnboardingRolePage() {
  async function handleSelectRole(role: UserRole) {
    "use server";
    await updateUserRole(role);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-semibold">选择你的身份</h1>
          <p className="mt-2 text-muted-foreground">请选择你在平台上的主要角色</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form action={handleSelectRole.bind(null, "client")}>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader className="text-center">
                <Briefcase className="w-12 h-12 mx-auto text-primary" />
                <CardTitle>我是雇主</CardTitle>
                <CardDescription>I want to hire</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  发布任务，雇佣开发者，管理项目
                </p>
              </CardContent>
            </Card>
          </form>

          <form action={handleSelectRole.bind(null, "freelancer")}>
            <Card className="cursor-pointer transition-shadow hover:shadow-lg">
              <CardHeader className="text-center">
                <Code2 className="w-12 h-12 mx-auto text-primary" />
                <CardTitle>我是开发者</CardTitle>
                <CardDescription>I want to work</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  接单任务，展示技能，赚取收入
                </p>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}