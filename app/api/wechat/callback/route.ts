export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { getWeComCryptFromEnv } from "@/lib/wechat/crypt";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const msgSignature = searchParams.get("msg_signature") ?? "";
  const timestamp = searchParams.get("timestamp") ?? "";
  const nonce = searchParams.get("nonce") ?? "";
  const echostr = searchParams.get("echostr") ?? "";

  if (!msgSignature || !timestamp || !nonce || !echostr) {
    return new NextResponse("Missing query params", { status: 400 });
  }

  try {
    const crypt = getWeComCryptFromEnv();

    const ok = crypt.verifySignature(msgSignature, timestamp, nonce, echostr);
    if (!ok) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const plain = crypt.decryptEchoStr(echostr);

    // Must be plain text, not JSON
    return new NextResponse(plain, {
      status: 200,
      headers: {
        "content-type": "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("[WeCom VerifyURL] error", error);
    return new NextResponse("Server error", { status: 500 });
  }
}
