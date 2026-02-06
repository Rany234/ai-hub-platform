"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Wallet } from "lucide-react";
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
  budget: z.number().positive("预算必须大于 0"),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateJobForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: 0,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await createJob(values as CreateJobInput);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error);
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      setError("发布失败，请稍后再试");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
                    placeholder="请详细描述你的需求，包括功能、技术栈、交付时间等..."
                    rows={6}
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
                    placeholder="例如：5000"
                    disabled={isSubmitting}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error === "INSUFFICIENT_FUNDS" ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="space-y-3 flex-1">
                  <h3 className="text-sm font-semibold text-red-800">余额不足</h3>
                  <p className="text-sm text-red-700">
                    发布任务需要托管资金，当前钱包余额不足以支付预算。
                  </p>
                  <Button variant="outline" size="sm" className="gap-2 border-red-200 hover:bg-red-100 text-red-800" asChild>
                    <Link href="/dashboard/wallet">
                      <Wallet className="h-4 w-4" />
                      去钱包充值
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : error ? (
            <p className="text-sm font-medium text-destructive">{error}</p>
          ) : null}

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "发布中..." : "发布任务"}
            </Button>
            <Button variant="outline" asChild disabled={isSubmitting}>
              <Link href="/dashboard">取消</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
