"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

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
  title: z.string().min(5, "标题是需求的门面，至少需要 5 个字哦"),
  description: z.string().min(20, "请详细描述需求（至少 20 字），这样才能吸引到大牛"),
  budget: z.coerce.number().gt(0, "预算必须大于 0"),
});

type FormData = z.infer<typeof formSchema>;

const shakeVariants = {
  shake: {
    x: [0, -8, 8, -8, 8, -4, 4, -2, 2, 0],
    transition: { duration: 0.5, ease: "easeInOut" },
  },
};

function ShakeWrapper({
  children,
  shouldShake,
}: {
  children: React.ReactNode;
  shouldShake: boolean;
}) {
  return (
    <motion.div
      variants={shakeVariants}
      animate={shouldShake ? "shake" : ""}
    >
      {children}
    </motion.div>
  );
}

export function CreateJobForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeFields, setShakeFields] = useState<Set<string>>(new Set());

  const form = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    shouldFocusError: false,
    defaultValues: {
      title: "",
      description: "",
      budget: undefined,
    },
  });

  const onSubmit = async (values: FormData) => {
    console.log("Submit Clicked");
    console.log("表单提交中...", values);
    setIsSubmitting(true);

    const toastId = toast.loading("正在发布您的 AI 需求...");

    try {
      await createJob(values as CreateJobInput);
      toast.success("发布成功！正在为您跳转到控制台", { id: toastId });
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : "发布失败，请稍后重试";
      toast.error(message, { id: toastId });
      setIsSubmitting(false);
    }
  };

  const onInvalid = () => {
    console.error("校验未通过", form.getValues());
    toast.warning("哎呀，表单还没填好，请查看红字提示");

    // 找出所有错误字段
    const errors = Object.keys(form.formState.errors);
    if (errors.length > 0) {
      // 触发震动
      setShakeFields(new Set(errors));
      setTimeout(() => setShakeFields(new Set()), 600);

      // 自动滚动到第一个错误字段
      const firstErrorField = errors[0];
      const firstErrorElement = document.querySelector(
        `[data-field="${firstErrorField}"]`
      );
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <ShakeWrapper shouldShake={shakeFields.has("title")}>
              <FormItem data-field="title">
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
            </ShakeWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <ShakeWrapper shouldShake={shakeFields.has("description")}>
              <FormItem data-field="description">
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
            </ShakeWrapper>
          )}
        />

        <FormField
          control={form.control}
          name="budget"
          render={({ field }) => (
            <ShakeWrapper shouldShake={shakeFields.has("budget")}>
              <FormItem data-field="budget">
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
            </ShakeWrapper>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                发布中...
              </span>
            ) : (
              "发布任务"
            )}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard">取消</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}