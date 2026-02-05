"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { createBid, type CreateBidInput } from "@/app/actions/bid";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BidFormSchema = z.object({
  amount: z.coerce.number().int().positive("报价必须是正整数"),
  deliveryTime: z.string().min(1, "请选择交付周期"),
  proposal: z.string().min(20, "投标方案至少 20 字"),
});

type BidFormValues = z.infer<typeof BidFormSchema>;

export function BidDrawer({
  jobId,
  trigger,
}: {
  jobId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BidFormValues>({
    resolver: zodResolver(BidFormSchema),
    mode: "onChange",
    defaultValues: {
      amount: 0,
      deliveryTime: "",
      proposal: "",
    },
  });

  const amountError = form.formState.errors.amount?.message;
  const deliveryTimeError = form.formState.errors.deliveryTime?.message;
  const proposalError = form.formState.errors.proposal?.message;

  const isValid = form.formState.isValid;

  const deliveryOptions = useMemo(
    () => [
      { value: "3d", label: "3 天" },
      { value: "7d", label: "1 周" },
      { value: "14d", label: "2 周" },
      { value: "30d", label: "1 个月" },
      { value: "custom", label: "可协商" },
    ],
    []
  );

  const onSubmit = async (values: BidFormValues) => {
    setIsSubmitting(true);
    const loadingId = toast.loading("正在提交投标...");

    try {
      const payload: CreateBidInput = {
        jobId,
        amount: values.amount,
        deliveryTime: values.deliveryTime,
        proposal: values.proposal,
      };

      const res = await createBid(payload);

      if (!res.success) {
        toast.error(res.error, { id: loadingId });
        return;
      }

      toast.success("投标成功！等待雇主联系。", { id: loadingId });
      setOpen(false);
      form.reset();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;

      const message = error instanceof Error ? error.message : "投标失败";
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
          <SheetTitle className="text-2xl font-bold">投标申请</SheetTitle>
          <SheetDescription>提交你的报价、交付周期和投标方案。</SheetDescription>
        </SheetHeader>

        <form
          className="px-4 pb-4 space-y-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-2">
            <Label htmlFor="amount">报价（元）</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ￥
              </span>
              <Input
                id="amount"
                type="number"
                inputMode="numeric"
                placeholder="输入你的诚意报价"
                className="pl-8"
                disabled={isSubmitting}
                {...form.register("amount")}
              />
            </div>
            {amountError ? (
              <p className="text-sm text-red-500 font-medium">{amountError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>交付周期</Label>
            <Select
              disabled={isSubmitting}
              value={form.watch("deliveryTime")}
              onValueChange={(v) => form.setValue("deliveryTime", v, { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="请选择交付周期" />
              </SelectTrigger>
              <SelectContent>
                {deliveryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {deliveryTimeError ? (
              <p className="text-sm text-red-500 font-medium">{deliveryTimeError}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="proposal">投标方案</Label>
            <Textarea
              id="proposal"
              rows={7}
              disabled={isSubmitting}
              placeholder="请描述你的实现思路、交付内容、里程碑、验收方式等..."
              {...form.register("proposal")}
            />
            {proposalError ? (
              <p className="text-sm text-red-500 font-medium">{proposalError}</p>
            ) : null}
          </div>

          <SheetFooter className="px-0">
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  提交中...
                </span>
              ) : (
                "提交投标"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
