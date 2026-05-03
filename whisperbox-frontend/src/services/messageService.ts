import {
  unwrapMessageKey,
  decryptMessage,
} from "@/src/crypto/messageDecrypt";

export async function decryptIncomingMessage({
  message,
  privateKey,
}: {
  message: any;
  privateKey: CryptoKey;
}) {
  // 1. pick correct key
  const encryptedKey = message.payload.encryptedKey;

  // 2. unwrap AES key
  const aesKey = await unwrapMessageKey(encryptedKey, privateKey);

  // 3. decrypt message
  const text = await decryptMessage(
    message.payload.ciphertext,
    message.payload.iv,
    aesKey
  );

  return {
    id: message.id,
    from: message.from_user_id,
    text,
    created_at: message.created_at,
  };
}