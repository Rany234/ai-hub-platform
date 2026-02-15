export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import path from "path";
import { mkdir, writeFile } from "fs/promises";

const MAX_SIZE = 200 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/zip",
  "application/x-zip-compressed",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "video/mp4",
  "video/quicktime",
  "text/plain",
  "text/markdown",
]);

type Purpose = "avatar" | "cover" | "delivery";

function isPurpose(x: unknown): x is Purpose {
  return x === "avatar" || x === "cover" || x === "delivery";
}

function safeFilename(filename: string) {
  const base = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 128) || "file";
  return base;
}

function randomId() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

/**
 * 本地存储模式（固定）：
 * - POST: 初始化，返回 PUT 上传 URL + local/<filename> fileKey
 * - PUT: 接收文件流并写入 public/uploads/
 */

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    console.log("[POST /api/upload] Incoming request:", {
      purpose: body.purpose,
      filename: body.filename,
      mimeType: body.mimeType,
      size: body.size,
    });

    if (!isPurpose(body.purpose)) {
      console.warn("[POST /api/upload] Invalid purpose:", body.purpose);
      return NextResponse.json({ error: `Invalid purpose: ${body.purpose}` }, { status: 400 });
    }

    const filename = safeFilename(String(body.filename || "file"));
    const mimeType = String(body.mimeType || "application/octet-stream");
    const size = Number(body.size);

    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }

    if (size > MAX_SIZE) {
      return NextResponse.json({ error: `File too large. Max is ${MAX_SIZE / 1024 / 1024}MB` }, { status: 400 });
    }

    // --- 修复点：改为基于后缀校验，解决浏览器识别 MIME 偏差问题 ---
    const ALLOWED_EXTENSIONS = new Set([
      ".zip", ".rar", ".7z", ".pdf", ".png", ".jpg", ".jpeg", 
      ".webp", ".mp4", ".mov", ".txt", ".md", ".exe"
    ]);
    
    const fileExt = path.extname(filename).toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.has(fileExt) && !ALLOWED_MIME.has(mimeType)) {
      console.warn("[POST /api/upload] Blocked by both ext and mime:", { fileExt, mimeType });
      return NextResponse.json({ 
        error: `File type not supported. Please use common formats like zip, pdf, etc.` 
      }, { status: 400 });
    }
    // -------------------------------------------------------

    const localKey = `local/${Date.now()}-${randomId()}-${filename}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    return NextResponse.json({
      method: "PUT",
      url: `${baseUrl}/api/upload?key=${encodeURIComponent(localKey)}`,
      fileKey: localKey,
      fileName: filename,
      fileType: mimeType,
      fileSize: size,
    });
  } catch (error) {
    console.error("[POST /api/upload] error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const fileKey = req.nextUrl.searchParams.get("key");
    if (!fileKey || !fileKey.startsWith("local/")) {
      return NextResponse.json({ error: "Invalid key" }, { status: 400 });
    }

    const blob = await req.blob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    const relative = fileKey.replace(/^local\//, "");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uploadPath = path.join(uploadDir, relative);
    await writeFile(uploadPath, buffer);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/upload] error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
