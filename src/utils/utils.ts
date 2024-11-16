import CryptoJS from "crypto-js";
import ECPairFactory from "ecpair";
import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "@bitcoin-js/tiny-secp256k1-asmjs";
import * as crypto from "crypto";

import { ec as EC } from "elliptic";

const ec = new EC("secp256k1");
export function generateAESKey() {
  // 32 字节 = 256 位
  const key = CryptoJS.lib.WordArray.random(32);
  // 将密钥转换为十六进制字符串
  return key.toString(CryptoJS.enc.Hex);
}

export function encryptPayloadAES(
  keyHex: string,
  payload: string,
  
): string {
  const key = CryptoJS.enc.Hex.parse(keyHex);
  const payloadWordArray = CryptoJS.enc.Hex.parse(payload);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(payloadWordArray, key, {
    iv: iv,
    mode: CryptoJS.mode.CFB,
    padding: CryptoJS.pad.NoPadding,
  });

  const ivAndCiphertext = iv.concat(encrypted.ciphertext);
  return ivAndCiphertext.toString(CryptoJS.enc.Hex);
}

export function decryptPayloadAES(
  keyHex: string,
  encryptedHex: string
): string {
  // 将密钥从 Hex 字符串解析为 WordArray
  const key = CryptoJS.enc.Hex.parse(keyHex);

  // 将加密的内容从 Hex 字符串解析为 WordArray
  const encryptedWordArray = CryptoJS.enc.Hex.parse(encryptedHex);

  // 从密文中提取 IV（前 16 字节）
  const iv = CryptoJS.lib.WordArray.create(
    encryptedWordArray.words.slice(0, 4),
  );

  // 提取实际的加密内容（去掉前 16 字节的 IV）
  const ciphertext = CryptoJS.lib.WordArray.create(
    encryptedWordArray.words.slice(4),
  );

  // 使用 AES 解密
  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: ciphertext }, // 解密的内容
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CFB,
      padding: CryptoJS.pad.NoPadding,
    }
  );

  // 将解密后的内容转换为 UTF-8 字符串
  return CryptoJS.enc.Hex.stringify(decrypted);
}


const test = () => {
  const encryptedData = encryptPayloadAES(
    "4b3693d67cbaae4c888f277eda6769cdd3a83ecc2e4bd6387e6388b78ba0a43f",
    "bb9c909269d336a6f2e3d45b9a2171ffab8b9719d6f64316e30e57e1960d6de4b75abc7c460e843edde942473d94e845"
  );
  console.log("Encrypted Data:", encryptedData);

  const randomKey = decryptPayloadAES(
    "ffd741ec751ddc6ee6ee88fbff5e5100e2ee817c4bb23601b725c2be52e0ae86",
    "90f47a25554e1c9fcaf6ac8e4c328972ceab602199cedd0feb0932b8aee0fde6e22a552c46c9d04749cb89c32c500645"
  );
  console.log("Random Key:", randomKey,Buffer.from(randomKey,'hex').toString('hex'));
  const decryptedData = decryptPayloadAES(
    randomKey,
    "1b88b60c32780821e7d53c12e7a4bf807eb5cac16e14fb42198c1ab5984ac209013f29807b10e16d1384f854903ab20c86ed0008fe6cdd7b74ed54862c5ddc1db51c3be58e7f00ce73bc13cdd45f21508aa15c566cab4ab8c813c1e1511e4c1007c3ffd5036893e8f9fc8c9cc0dfee1068bf44790ddcb6f0e749ac99f1cc59b05181349e62fb70d432ba6db28aabf4f30c624b9f643e39ea3b493b9908b6e18630c7a5b774f9e488cd0afe7a13e4713768f9cb97a4318a1f7583484019200e2422992849c6ffcdc329ade033db3cfbddd4284f6e2ff37ff68deafe6c67f3f636ae95e01a2ff45d2c8f166bd872a3476243f015e8a23bfcde529ce1512d1a59aa5bf86cea043338c3e4722d559e6332c686d26df01d520a93fe14958f719940babe02035906c87d3c943da68be762ed5163c5419916bb4c1be0d2c8df9ad717596a0d29be5c96859c1f97b8514667df66529f4083ef06a0e89c918540fe963a52a20785f3a087394a2fd467053c40478917ea4510d66eb69be2db0c6cd9a7a0c0bf932189031a103c02ff",
  );
  console.log("Decrypted Data:",decryptedData, Buffer.from(decryptedData,'hex').toString('utf-8'));
};

test();
