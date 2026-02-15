import dotenv from "dotenv";
import path from "path";
import crypto from "crypto";

import { WXBizMsgCrypt } from "../lib/wechat/crypt";

// Load env like Next.js
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function mustGetEnv(key: string) {
  const v = process.env[key];
  if (!v) throw new Error(`Missing ${key} in env. Please set it in .env.local/.env`);
  return v;
}

function randomNonce() {
  return crypto.randomBytes(8).toString("hex");
}

function randomEchoStr() {
  // plain text we expect after decrypt
  return `echo_${crypto.randomBytes(12).toString("hex")}`;
}

async function main() {
  const token = mustGetEnv("WECOM_TOKEN");
  const encodingAesKey = mustGetEnv("WECOM_ENCODING_AES_KEY");
  const corpId = mustGetEnv("WECOM_CORP_ID");

  const cryptor = new WXBizMsgCrypt(token, encodingAesKey, corpId);

  const echostrPlain = randomEchoStr();
  const echostrEncrypted = cryptor.encryptEchoStr(echostrPlain);

  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomNonce();
  const msg_signature = cryptor.generateSignature(timestamp, nonce, echostrEncrypted);

  const url = new URL("http://localhost:3000/api/wechat/callback");
  url.searchParams.set("msg_signature", msg_signature);
  url.searchParams.set("timestamp", timestamp);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("echostr", echostrEncrypted);

  console.log("--- WeCom VerifyURL Mock ---");
  console.log("plain echostr:", echostrPlain);
  console.log("encrypted echostr:", echostrEncrypted);
  console.log("request:", url.toString());

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "cache-control": "no-cache" },
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  if (text !== echostrPlain) {
    throw new Error(`Mismatch: expected '${echostrPlain}', got '${text}'`);
  }

  console.log("✅ 本地验证通过，可以部署！");
}

main().catch((e) => {
  console.error("❌ 本地验证失败：", e);
  process.exit(1);
});
