"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createJob, type CreateJobInput } from "@/app/actions/job";

const formSchema = z.object({
  title: z.string().min(5, "标题至少 5 个字"),
  description: z.string().min(20, "描述至少 20 个字"),
  budget: z.coerce.number().gt(0, "预算必须大于 0"),
});

type FormData = z.infer<typeof formSchema>;

export function CreateJobForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: undefined,
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    try {
      await createJob(values as CreateJobInput);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="text-sm font-medium">任务标题</label>
        <Input
          {...form.register("title")}
          placeholder="例如：开发一个 AI 聊天机器人"
          disabled={isSubmitting}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">任务描述</label>
        <Textarea
          {...form.register("description")}
          placeholder="请详细描述你的需求，包括功能、技术栈、交付时间等..."
          rows={6}
          disabled={isSubmitting}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">预算（元）</label>
        <Input
          type="number"
          {...form.register("budget", { valueAsNumber: true })}
          placeholder="例如：5000"
          disabled={isSubmitting}
        />
        {form.formState.errors.budget && (
          <p className="text-sm text-red-600 mt-1">{form.formState.errors.budget.message}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "发布中..." : "发布任务"}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard">取消</Link>
        </Button>
      </div>
    </form>
  );
}