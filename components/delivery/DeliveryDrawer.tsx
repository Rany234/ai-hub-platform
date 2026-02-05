"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PackageCheck } from "lucide-react";

import { submitDelivery } from "@/app/actions/job";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const DeliverySchema = z.object({
  deliveryUrl: z.string().url("请输入有效的链接（http/https）"),
  deliveryNote: z.string().min(10, "交付说明至少 10 个字"),
});

type DeliveryFormValues = z.infer<typeof DeliverySchema>;

export function DeliveryDrawer({
  jobId,
  trigger,
  defaultUrl,
  defaultNote,
  onSubmitted,
}: {
  jobId: string;
  trigger: React.ReactNode;
  defaultUrl?: string | null;
  defaultNote?: string | null;
  onSubmitted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(DeliverySchema),
    mode: "onChange",
    defaultValues: {
      deliveryUrl: defaultUrl ?? "",
      deliveryNote: defaultNote ?? "",
    },
  });

  const urlError = form.formState.errors.deliveryUrl?.message;
  const noteError = form.formState.errors.deliveryNote?.message;

  const isValid = form.formState.isValid;

  const titleSuffix = useMemo(() => (defaultUrl || defaultNote ? "（更新）" : ""), [defaultUrl, defaultNote]);

  const onSubmit = async (values: DeliveryFormValues) => {
    setIsSubmitting(true);
    const loadingId = toast.loading("正在提交交付成果...");

    try {
      const res = await submitDelivery({
        jobId,
        deliveryUrl: values.deliveryUrl,
        deliveryNote: values.deliveryNote,
      });

      if (!res.success) {
        toast.error(res.error || "提交失败，请重试", { id: loadingId, duration: 6000 });
        return;
      }

      toast.success("交付提交成功！等待雇主验收。", { id: loadingId, duration: 4000 });

      await new Promise((r) => setTimeout(r, 400));
      setOpen(false);
      onSubmitted?.();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;

      const message = error instanceof Error ? error.message : "提交失败";
      toast.error(message, { id: loadingId });
    } finally {
      toast.dismiss();
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">提交交付成果{titleSuffix}</SheetTitle>
          <SheetDescription>提交代码仓库 / 演示地址，并说明已完成的功能与交付内容。</SheetDescription>
        </SheetHeader>

        <form className="px-4 pb-4 space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="deliveryUrl">成果链接</Label>
            <Input
              id="deliveryUrl"
              type="url"
              placeholder="https://github.com/... 或 https://demo.example.com"
              disabled={isSubmitting}
              {...form.register("deliveryUrl")}
            />
            {urlError ? <p className="text-sm text-red-500 font-medium">{urlError}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryNote">交付说明</Label>
            <Textarea
              id="deliveryNote"
              rows={7}
              disabled={isSubmitting}
              placeholder="请描述已完成的功能、里程碑、使用方式、验收要点等..."
              {...form.register("deliveryNote")}
            />
            {noteError ? <p className="text-sm text-red-500 font-medium">{noteError}</p> : null}
          </div>

          <SheetFooter className="px-0">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  提交中...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <PackageCheck className="h-5 w-5" />
                  提交交付成果
                </span>
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
