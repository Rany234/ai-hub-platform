"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createJob, type CreateJobInput } from "@/app/actions/job";

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

const formSchema = z.object({
  title: z.string().min(5, "标题至少5个字，给你的需求起个响亮的名字吧"),
  description: z.string().min(20, "描述至少20个字，详情越清楚，开发者接单越快"),
  budget: z.coerce.number().positive().int("预算必须是正整数"),
});

type CreateJobFormValues = z.infer<typeof formSchema>;

const defaultValues = {
  title: "",
  description: "",
  budget: 0,
};

export function CreateJobForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(formSchema) as any,
    mode: "onChange",
    defaultValues,
  });

  const onSubmit = async (values: CreateJobFormValues) => {
    setIsSubmitting(true);
    const loadingId = toast.loading("正在发布任务...");

    try {
      const payload: CreateJobInput = {
        title: values.title,
        description: values.description,
        budget: values.budget,
      };

      await createJob(payload);
      toast.success("发布成功！", { id: loadingId, duration: 3000 });
      router.push("/dashboard/jobs");
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;

      const message = error instanceof Error ? error.message : "发布失败";
      toast.error(message, { id: loadingId, duration: 6000 });
    } finally {
      toast.dismiss();
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
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
              <FormMessage />
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
                  rows={7}
                  placeholder="请详细描述你的需求，包括功能、技术栈、交付时间等..."
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
                  inputMode="numeric"
                  placeholder="例如：5000"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={!form.formState.isValid || isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                发布中...
              </span>
            ) : (
              "发布任务"
            )}
          </Button>

          <Button variant="outline" asChild disabled={isSubmitting}>
            <Link href="/dashboard/jobs">取消</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}