import CryptoJS from "crypto-js";
export function generateAESKey() {
  // 32 字节 = 256 位
  const key = CryptoJS.lib.WordArray.random(32);

  // 将密钥转换为十六进制字符串
  return key.toString(CryptoJS.enc.Hex);
}

export function encryptPayloadAES(key: string, payload: string): string {
  // 生成一个随机的 16 字节 IV
  const iv = CryptoJS.lib.WordArray.random(16);

  // 将密钥转换为 CryptoJS 支持的格式
  const keyWordArray = CryptoJS.enc.Utf8.parse(key);

  // 使用 AES-CFB 模式进行加密
  const encrypted = CryptoJS.AES.encrypt(
    CryptoJS.enc.Utf8.parse(payload),
    keyWordArray,
    {
      iv: iv,
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.NoPadding, // CFB 模式不需要填充
    }
  );

  // 将 IV 和密文拼接，以便解密时使用
  const ivCiphertext = iv.concat(encrypted.ciphertext);

  return ivCiphertext.toString(CryptoJS.enc.Base64);
}

export function decryptPayloadAES(
  key: string,
  encryptedPayload: string
): string {
  // 从密文中提取 IV 和加密数据
  const ivCiphertext = CryptoJS.enc.Base64.parse(encryptedPayload);
  const iv = CryptoJS.lib.WordArray.create(ivCiphertext.words.slice(0, 4)); // 16 字节 IV
  const ciphertext = CryptoJS.lib.WordArray.create(ivCiphertext.words.slice(4)); // 密文

  // 解密
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphertext } as any,
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: iv,
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.NoPadding, // CFB 模式不需要填充
    }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}
