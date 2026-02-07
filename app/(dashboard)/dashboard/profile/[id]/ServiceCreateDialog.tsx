"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createService } from "@/app/actions/services";

export function ServiceCreateDialog() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    setError(null);

    const priceNum = Number(price);
    const daysNum = Number(deliveryDays);

    startTransition(async () => {
      const res = await createService({
        title,
        description,
        price: priceNum,
        delivery_days: daysNum,
      });

      if (!(res as any)?.success) {
        setError((res as any)?.error ?? "发布失败");
        return;
      }

      setTitle("");
      setDescription("");
      setPrice("");
      setDeliveryDays("");
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">➕ 发布新服务</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>发布新服务</DialogTitle>
          <DialogDescription>填写服务信息，让雇主快速了解你的能力与报价。</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">标题</div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：Build a React Landing Page" disabled={isPending} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">描述</div>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="说明交付内容、技术栈、交付标准等" className="min-h-[120px]" disabled={isPending} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">起步价 (CNY)</div>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="例如：2999" disabled={isPending} />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">交付天数</div>
              <Input type="number" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} placeholder="例如：7" disabled={isPending} />
            </div>
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            取消
          </Button>
          <Button
            onClick={onSubmit}
            disabled={
              isPending ||
              !title.trim() ||
              !Number.isFinite(Number(price)) ||
              Number(price) <= 0 ||
              !Number.isFinite(Number(deliveryDays)) ||
              Number(deliveryDays) <= 0
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "发布中..." : "发布"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
