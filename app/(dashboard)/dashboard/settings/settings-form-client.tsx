"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AvatarUpload } from "@/components/AvatarUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { updateProfile } from "@/app/actions/profile";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  bio: string | null;
  website: string | null;
  avatar_url: string | null;
};

export function SettingsFormClient({
  userId,
  initialProfile,
}: {
  userId: string;
  initialProfile: Profile | null;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [fullName, setFullName] = useState(initialProfile?.full_name ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url ?? "");
  const [email, setEmail] = useState((initialProfile as any)?.email ?? "");
  const [wechatId, setWechatId] = useState((initialProfile as any)?.wechat_id ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile() {
    setSaving(true);
    setError(null);

    try {
      const result = await updateProfile({
        title: fullName.trim() || null,
        bio: bio.trim() || null,
        skills: null,
      });
      if (!result?.success) {
        throw new Error(result?.error ?? "保存失败");
      }

      toast.success("个人资料已更新");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">头像</Label>
            <AvatarUpload
              userId={userId}
              currentUrl={avatarUrl || null}
              onUploaded={(url) => {
                setAvatarUrl(url);
              }}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="full_name">昵称（Full Name）</Label>
            <Input
              id="full_name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="例如：张三"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">简介（Bio）</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下你擅长的领域、工作方式等"
            />
          </div>

          <div className="border-t pt-6" />

          <div className="grid gap-2">
            <Label htmlFor="email">邮箱（Email）</Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="wechat_id">微信号（WeChat ID）</Label>
            <Input
              id="wechat_id"
              value={wechatId}
              onChange={(e) => setWechatId(e.target.value)}
              placeholder="填写你的微信号"
            />
          </div>

          {error ? <div className="text-sm text-red-600">{error}</div> : null}

          <div>
            <Button onClick={() => void saveProfile()} disabled={saving}>
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  保存中...
                </span>
              ) : (
                "保存修改"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
