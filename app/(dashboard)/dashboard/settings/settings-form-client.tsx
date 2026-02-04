"use client";

import { useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AvatarUpload } from "@/components/AvatarUpload";

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

  const [fullName, setFullName] = useState(initialProfile?.full_name ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [website, setWebsite] = useState(initialProfile?.website ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile?.avatar_url ?? "");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function saveProfile() {
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const { error: upsertError } = await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName || null,
        bio: bio || null,
        website: website || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      });

      if (upsertError) throw upsertError;

      setMessage("保存成功");

      setTimeout(() => {
        setMessage((m) => (m === "保存成功" ? null : m));
      }, 2500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border rounded-lg p-4">
      <AvatarUpload
        userId={userId}
        currentUrl={avatarUrl || null}
        onUploaded={(url) => {
          setAvatarUrl(url);
        }}
      />

      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void saveProfile();
        }}
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="full_name">
            昵称 / 姓名
          </label>
          <input
            id="full_name"
            className="border rounded-md px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="例如：张三"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="bio">
            简介
          </label>
          <textarea
            id="bio"
            className="border rounded-md px-3 py-2 min-h-24"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="介绍一下你擅长的领域、工作方式等"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="website">
            个人网站
          </label>
          <input
            id="website"
            className="border rounded-md px-3 py-2"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="border rounded-md px-4 py-2 bg-black text-white disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "保存中..." : "保存"}
          </button>

          {message ? <div className="text-sm text-green-700">{message}</div> : null}
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
        </div>
      </form>
    </div>
  );
}
