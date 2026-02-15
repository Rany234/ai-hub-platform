import crypto from "crypto";

export class WeComCryptError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeComCryptError";
  }
}

function sha1(content: string) {
  return crypto.createHash("sha1").update(content).digest("hex");
}

function pkcs7Unpad(buf: Buffer) {
  if (buf.length === 0) throw new WeComCryptError("PKCS7 unpad: empty buffer");
  const pad = buf[buf.length - 1];
  if (pad < 1 || pad > 32) throw new WeComCryptError("PKCS7 unpad: invalid padding");
  return buf.subarray(0, buf.length - pad);
}

function decodeBase64(input: string) {
  // WeCom uses standard base64. incoming may contain url-escaped chars.
  return Buffer.from(input, "base64");
}

/**
 * Minimal WXBizMsgCrypt implementation for WeCom callback Verify URL.
 *
 * Ref: WeCom callback verification requires verifying msg_signature and decrypting echostr.
 */
export class WXBizMsgCrypt {
  private token: string;
  private encodingAesKey: string;
  private corpId: string;
  private aesKey: Buffer;

  constructor(token: string, encodingAesKey: string, corpId: string) {
    if (!token) throw new WeComCryptError("Missing WECOM_TOKEN");
    if (!encodingAesKey) throw new WeComCryptError("Missing WECOM_ENCODING_AES_KEY");
    if (!corpId) throw new WeComCryptError("Missing WECOM_CORP_ID");

    if (encodingAesKey.length !== 43) {
      throw new WeComCryptError("WECOM_ENCODING_AES_KEY must be 43 chars (base64 without padding)");
    }

    this.token = token;
    this.encodingAesKey = encodingAesKey;
    this.corpId = corpId;

    // AESKey = base64(EncodingAESKey + "=")
    this.aesKey = Buffer.from(`${encodingAesKey}=`, "base64");
    if (this.aesKey.length !== 32) {
      throw new WeComCryptError("Invalid AES key length after base64 decode (expected 32 bytes)");
    }
  }

  /**
   * Signature: sha1(sort(token, timestamp, nonce, encrypt))
   */
  public verifySignature(msgSignature: string, timestamp: string, nonce: string, encrypt: string) {
    const params = [this.token, timestamp, nonce, encrypt].sort();
    const sign = sha1(params.join(""));
    return sign === msgSignature;
  }

  /**
   * Decrypt the Verify URL echostr.
   * echostr is base64( AES-CBC( random16 + msg_len(4) + msg + corpId , key, iv=key[0..15]) )
   */
  public decryptEchoStr(echostr: string): string {
    const encrypted = decodeBase64(echostr);
    const iv = this.aesKey.subarray(0, 16);

    const decipher = crypto.createDecipheriv("aes-256-cbc", this.aesKey, iv);
    decipher.setAutoPadding(false);

    const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    const unpadded = pkcs7Unpad(plain);

    if (unpadded.length < 16 + 4) {
      throw new WeComCryptError("Decrypted content too short");
    }

    const msgLen = unpadded.readUInt32BE(16);
    const msgStart = 20;
    const msgEnd = msgStart + msgLen;
    if (msgEnd > unpadded.length) {
      throw new WeComCryptError("Invalid msg length in decrypted content");
    }

    const msg = unpadded.subarray(msgStart, msgEnd).toString("utf8");
    const corpId = unpadded.subarray(msgEnd).toString("utf8");

    if (corpId !== this.corpId) {
      throw new WeComCryptError("corpId mismatch");
    }

    return msg;
  }

  /**
   * Encrypt a message for Verify URL.
   * Format: random16 + msg_len(4) + msg + corpId + padding
   */
  public encryptEchoStr(msg: string): string {
    const random16 = crypto.randomBytes(16);
    const msgBuf = Buffer.from(msg);
    const msgLenBuf = Buffer.alloc(4);
    msgLenBuf.writeUInt32BE(msgBuf.length);
    const corpIdBuf = Buffer.from(this.corpId);

    const rawBuf = Buffer.concat([random16, msgLenBuf, msgBuf, corpIdBuf]);

    // PKCS7 padding
    const padLen = 32 - (rawBuf.length % 32);
    const padding = Buffer.alloc(padLen, padLen);
    const paddedBuf = Buffer.concat([rawBuf, padding]);

    const iv = this.aesKey.subarray(0, 16);
    const cipher = crypto.createCipheriv("aes-256-cbc", this.aesKey, iv);
    cipher.setAutoPadding(false);

    const encrypted = Buffer.concat([cipher.update(paddedBuf), cipher.final()]);
    return encrypted.toString("base64");
  }

  /**
   * Helper to generate a signature for testing
   */
  public generateSignature(timestamp: string, nonce: string, encrypt: string): string {
    const params = [this.token, timestamp, nonce, encrypt].sort();
    return sha1(params.join(""));
  }
}

export function getWeComCryptFromEnv() {
  const token = process.env.WECOM_TOKEN ?? "";
  const encodingAesKey = process.env.WECOM_ENCODING_AES_KEY ?? "";
  const corpId = process.env.WECOM_CORP_ID ?? "";

  return new WXBizMsgCrypt(token, encodingAesKey, corpId);
}
