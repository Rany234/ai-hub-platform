"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createJob, type CreateJobInput } from "@/app/actions/job";

const formSchema = z.object({
  title: z.string().min(5, "标题至少需要 5 个字"),
  description: z.string().min(2, "描述太短啦，再多写几个字吧"),
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
    console.log("表单提交中...", values);
    setIsSubmitting(true);
    try {
      await createJob(values as CreateJobInput);
      alert("发布成功，正在跳转...");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务标题</FormLabel>
              <FormControl>
                <Input
                  placeholder="例如：开发一个 AI 聊天机器人"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 font-medium mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="请详细描述你的需求，包括功能、技术栈、交付时间等..."
                  rows={6}
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 font-medium mt-1" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>预算（元）</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="例如：5000"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 font-medium mt-1" />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "发布中..." : "发布任务"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">取消</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}