import { useEffect, useState } from "react";
import { apiFetch } from "@/src/lib/api";
import { getPrivateKey, getUser } from "@/src/auth/session";
import { decryptIncomingMessage } from "@/src/services/messageService";

export function useConversationMessages(userId: string | null) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setMessages([]);
      return;
    }

    const run = async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/conversations/${userId}/messages`);
        if (!Array.isArray(data)) {
          setMessages([]);
          return;
        }

        let privateKey: CryptoKey | null = null;
        try {
          privateKey = getPrivateKey();
        } catch (_) {
          // private key not in memory (e.g. page refresh) — show placeholder
        }

        const currentUser = getUser();

        const decrypted = await Promise.all(
          data.map(async (msg: any) => {
            if (!msg.payload?.ciphertext || !msg.payload?.iv) {
              return { ...msg, text: "[No content]" };
            }
            if (!privateKey) {
              return { ...msg, text: "[Session expired — please log in again]" };
            }
            try {
              // Use encryptedKeyForSelf when we are the sender so we can read our own messages
              const isSender = msg.from_user_id === currentUser?.id;
              const keyToUse = isSender
                ? msg.payload.encryptedKeyForSelf
                : msg.payload.encryptedKey;

              return await decryptIncomingMessage({
                message: { ...msg, payload: { ...msg.payload, encryptedKey: keyToUse } },
                privateKey,
              });
            } catch (e) {
              console.warn("Decryption failed for message", msg.id, e);
              return { ...msg, text: "[Encrypted message]" };
            }
          })
        );

        // API returns newest-first; reverse for display
        setMessages(decrypted.reverse());
      } catch (err) {
        console.error("Failed to load messages:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [userId]);

  return { messages, loading };
}
