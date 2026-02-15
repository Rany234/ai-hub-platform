"use client";

import { useCallback, useRef, useState } from "react";

type Props = {
  userId: string;
  currentUrl?: string | null;
  onUploaded: (publicUrl: string) => void;
  size?: number;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/");
}

export function AvatarUpload({ currentUrl, size = 96 }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      // 暂时仅做预览提示，后续对接服务器上传逻辑
      console.log("已选择文件:", file.name);
      setError("文件上传功能正在重构中...");
      
      if (inputRef.current) inputRef.current.value = "";
    },
    []
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
      </button>

      <div className="flex flex-col gap-1">
        <div className="text-sm font-bold text-slate-200">头像</div>
        <button
          type="button"
          onClick={openPicker}
          className="text-sm text-brand-action underline hover:text-amber-400 transition-colors"
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
