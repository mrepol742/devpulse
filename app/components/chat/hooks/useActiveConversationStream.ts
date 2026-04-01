"use client";

import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";
import type { Message } from "@/app/components/Chat";

type TypingState = {
  user_id: string;
  label: string;
};

type UseActiveConversationStreamParams = {
  supabase: SupabaseClient<Database>;
  conversationId: string | null;
  userId: string;
  channelRef: MutableRefObject<RealtimeChannel | null>;
  bottomRef: RefObject<HTMLDivElement | null>;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  markConversationAsRead: (targetConversationId: string) => Promise<void>;
  setRemoteTypingState: (targetConversationId: string, state: TypingState | null) => void;
  stopTyping: (targetConversationId: string) => void;
};

const getAttachmentFingerprint = (attachments: Message["attachments"] = []) =>
  attachments
    .map((attachment) => {
      const filename = attachment?.filename ?? "";
      const mimetype = attachment?.mimetype ?? "";
      const filesize = String(attachment?.filesize ?? 0);
      const publicUrl = attachment?.public_url ?? "";
      return `${filename}|${mimetype}|${filesize}|${publicUrl}`;
    })
    .join("::");

export function useActiveConversationStream({
  supabase,
  conversationId,
  userId,
  channelRef,
  bottomRef,
  setMessages,
  markConversationAsRead,
  setRemoteTypingState,
  stopTyping,
}: UseActiveConversationStreamParams) {
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }

    void markConversationAsRead(conversationId);

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "broadcast",
        {
          event: "typing",
        },
        ({ payload }) => {
          const typingPayload = payload as {
            conversation_id?: string;
            user_id?: string;
            email?: string | null;
            is_typing?: boolean;
          };

          if (typingPayload.conversation_id !== conversationId) return;
          if (!typingPayload.user_id || typingPayload.user_id === userId) return;

          if (typingPayload.is_typing) {
            setRemoteTypingState(conversationId, {
              user_id: typingPayload.user_id,
              label: typingPayload.email?.split("@")[0] || "Someone",
            });
            return;
          }

          setRemoteTypingState(conversationId, null);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const incomingMessage: Message = {
            id: payload.new.id,
            conversation_id: payload.new.conversation_id,
            sender_id: payload.new.sender_id,
            text: payload.new.text,
            attachments: payload.new.attachments ?? [],
            created_at: payload.new.created_at,
          };

          setMessages((prev) => {
            if (prev.some((message) => message.id === incomingMessage.id)) {
              return prev;
            }

            const incomingFingerprint = getAttachmentFingerprint(
              incomingMessage.attachments,
            );

            const optimisticMessageIndex = prev.findIndex((message) => {
              if (!message.id.startsWith("temp-")) return false;
              if (message.sender_id !== incomingMessage.sender_id) return false;
              if (message.conversation_id !== incomingMessage.conversation_id) {
                return false;
              }
              if (message.text !== incomingMessage.text) return false;

              return (
                getAttachmentFingerprint(message.attachments) ===
                incomingFingerprint
              );
            });

            if (optimisticMessageIndex === -1) {
              return [...prev, incomingMessage];
            }

            const next = [...prev];
            next[optimisticMessageIndex] = incomingMessage;
            return next;
          });

          if (payload.new.sender_id !== userId) {
            void markConversationAsRead(conversationId);
          }

          window.setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        },
      )
      .subscribe();

    channelRef.current = channel;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (!data) return;

      setMessages(data as Message[]);
      void markConversationAsRead(conversationId);
      window.setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };

    void fetchMessages();

    return () => {
      stopTyping(conversationId);
      setRemoteTypingState(conversationId, null);
      channel.unsubscribe();
    };
  }, [
    bottomRef,
    channelRef,
    conversationId,
    markConversationAsRead,
    setMessages,
    setRemoteTypingState,
    stopTyping,
    supabase,
    userId,
  ]);
}