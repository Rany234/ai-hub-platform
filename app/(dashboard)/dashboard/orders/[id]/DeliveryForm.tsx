"use client";

import { useState } from "react";
import { Loader2, Upload, FileCheck, X, FileText, Archive, Film, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { createDeliveryAction } from "@/features/orders/actions";
import { useRouter } from "next/navigation";

type FileMeta = {
  fileKey: string;
  fileName: string;
  fileSize: number;
  fileType: string;
};

export default function DeliveryForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon className="h-4 w-4" />;
    if (type.includes("video")) return <Film className="h-4 w-4" />;
    if (type.includes("zip") || type.includes("archive")) return <Archive className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const handleUpload = async () => {
    if (!file) return null;

    setUploading(true);
    setProgress(10);

    try {
      // 1. 获取预签名 URL
      const initRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          purpose: "delivery",
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          size: file.size,
        }),
      });

      if (!initRes.ok) {
        const err = await initRes.json();
        throw new Error(err.error || "初始化上传失败");
      }

      const { url, fileKey, fileName, fileType, fileSize } = await initRes.json();
      setProgress(30);

      // 2. 直传 OSS (使用 XMLHttpRequest 以支持进度)
      return new Promise<FileMeta>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", url);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 60) + 30; // 30% -> 90%
            setProgress(pct);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 200) {
            setProgress(100);
            resolve({ fileKey, fileName, fileSize, fileType });
          } else {
            reject(new Error("文件上传失败"));
          }
        };

        xhr.onerror = () => reject(new Error("网络错误"));
        xhr.send(file);
      });
    } catch (e) {
      throw e;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("请输入交付说明");

    setIsSubmitting(true);
    try {
      let fileMeta: FileMeta | null = null;
      if (file) {
        fileMeta = await handleUpload();
      }

      const result = await createDeliveryAction(orderId, content, fileMeta);
      if (result.success) {
        toast.success("交付成功！");
        setContent("");
        setFile(null);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "提交失败");
    } finally {
      setIsSubmitting(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-[#151F32] border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Upload className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-white">提交交付成果</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">交付说明 (必填)</label>
          <textarea
            className="w-full bg-[#0B1121] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all min-h-[100px]"
            placeholder="描述你交付的内容，如解压密码、使用说明等..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">附件 (支持 zip, pdf, mp4, img 等, 最大 200MB)</label>
          
          {!file ? (
            <div 
              className="relative border-2 border-dashed border-white/10 hover:border-amber-500/50 hover:bg-amber-500/5 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <Upload className="h-8 w-8 text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">点击或拖拽上传文件</p>
              <input 
                id="file-upload" 
                type="file" 
                className="hidden" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          ) : (
            <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  {getFileIcon(file.type)}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-200 truncate max-w-[200px]">{file.name}</div>
                  <div className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setFile(null)}
                className="p-1 hover:bg-white/5 rounded-full text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {progress > 0 && (
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-amber-500 h-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || (uploading && progress < 100)}
          className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-black py-3 font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>正在提交...</span>
            </>
          ) : (
            <>
              <FileCheck className="h-4 w-4" />
              <span>确认交付</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
