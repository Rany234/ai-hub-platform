"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  userId: string;
  currentUrl?: string | null;
  onUploaded: (publicUrl: string) => void;
  size?: number;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function AvatarUpload({ userId, currentUrl, onUploaded, size = 96 }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const openPicker = useCallback(() => {
    setError(null);
    inputRef.current?.click();
  }, []);

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!isImageFile(file)) {
        setError("请选择图片文件");
        return;
      }

      try {
        setUploading(true);
        setError(null);

        const ext = file.name.split(".").pop() || "png";
        const path = `${userId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true, contentType: file.type });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("avatars").getPublicUrl(path);
        const publicUrl = data.publicUrl;

        if (!publicUrl) throw new Error("无法获取头像公开地址");

        onUploaded(publicUrl);

        if (inputRef.current) inputRef.current.value = "";
      } catch (err) {
        setError(err instanceof Error ? err.message : "上传失败");
      } finally {
        setUploading(false);
      }
    },
    [onUploaded, supabase, userId]
  );

  const boxStyle: React.CSSProperties = {
    width: size,
    height: size,
  };

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={openPicker}
        className="relative overflow-hidden rounded-full border border-[#334155] bg-slate-800 hover:border-brand-action/50 transition-colors"
        style={boxStyle}
        disabled={uploading}
        aria-label="更换头像"
      >
        {currentUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="avatar" src={currentUrl} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
            无头像
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center text-xs text-white font-medium">
            上传中...
          </div>
        ) : null}
      </button>

      <div className="flex flex-col gap-1">
        <div className="text-sm font-bold text-slate-200">头像</div>
        <button
          type="button"
          onClick={openPicker}
          className="text-sm text-brand-action underline hover:text-amber-400 transition-colors disabled:opacity-50"
          disabled={uploading}
        >
          点击更换
        </button>
        {error ? <div className="text-xs text-red-400 font-medium">{error}</div> : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileChange}
      />
    </div>
  );
}
