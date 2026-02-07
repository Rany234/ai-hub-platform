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

import { updateProfile } from "@/app/actions/profile";

export function ProfileEditDialog({
  profile,
}: {
  profile: {
    id: string;
    title: string | null;
    bio: string | null;
    skills: string[] | null;
  };
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(profile.title ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [skillsText, setSkillsText] = useState((profile.skills ?? []).join(", "));
  const [error, setError] = useState<string | null>(null);

  const onSave = () => {
    setError(null);
    startTransition(async () => {
      const skills = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await updateProfile({
        title: title.trim() || null,
        bio: bio.trim() || null,
        skills: skills.length ? skills : null,
      });

      if (!(res as any)?.success) {
        setError((res as any)?.error ?? "保存失败");
        return;
      }

      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-slate-200">
          ✏️ 编辑资料
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>编辑资料</DialogTitle>
          <DialogDescription>更新你的公开信息（头衔、简介、技能）</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">头衔</div>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例如：全栈工程师" />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">简介</div>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下你自己..."
              className="min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">技能 (逗号分隔)</div>
            <Input
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="React, Next.js, Supabase"
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
            取消
          </Button>
          <Button onClick={onSave} disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
            {isPending ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
