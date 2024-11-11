import CryptoJS from "crypto-js";
export function generateAESKey() {
  // 32 字节 = 256 位
  const key = CryptoJS.lib.WordArray.random(32);
  return key;
}
