"use client";

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toast } from "react-toastify";
import type { Database } from "@/app/supabase-types";
import type { ChatUser, Conversation } from "@/app/components/Chat";

type ParticipantPresence = {
  last_seen_at: string | null;
  last_read_at: string | null;
};

type UseChatConversationActionsParams = {
  supabase: SupabaseClient<Database>;
  userId: string;
  userEmail: string | null | undefined;
  conversationId: string | null;
  conversations: Conversation[];
  creatingRef: MutableRefObject<boolean>;
  unseenPresenceIso: string;
  setConversationId: Dispatch<SetStateAction<string | null>>;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setShowRightSidebar: Dispatch<SetStateAction<boolean>>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setUnreadCountByConversationId: Dispatch<SetStateAction<Record<string, number>>>;
  setParticipantMetaByConversationId: Dispatch<
    SetStateAction<Record<string, ParticipantPresence>>
  >;
};

export function useChatConversationActions({
  supabase,
  userId,
  userEmail,
  conversationId,
  conversations,
  creatingRef,
  unseenPresenceIso,
  setConversationId,
  setShowModal,
  setShowRightSidebar,
  setConversations,
  setUnreadCountByConversationId,
  setParticipantMetaByConversationId,
}: UseChatConversationActionsParams) {
  const createConversation = useCallback(
    async (otherUser: ChatUser) => {
      if (creatingRef.current) return;
      creatingRef.current = true;

      try {
        const existing = conversations.find((conversation) => {
          if (conversation.type === "global") return false;

          const participantIds = new Set(conversation.users.map((u) => u.id));
          return (
            participantIds.size === 2 &&
            participantIds.has(userId) &&
            participantIds.has(otherUser.user_id)
          );
        });

        if (existing) {
          setConversationId(existing.id);
          setShowModal(false);
          return;
        }

        const { data: conversationData } = await supabase
          .from("conversations")
          .insert({ type: "private" })
          .select("*")
          .single();

        if (!conversationData) return;

        const createdConversationId = conversationData.id;
        const timestamp = new Date().toISOString();

        await supabase.from("conversation_participants").upsert(
          [
            {
              conversation_id: createdConversationId,
              user_id: userId,
              email: userEmail,
              last_seen_at: timestamp,
              last_read_at: timestamp,
            },
            {
              conversation_id: createdConversationId,
              user_id: otherUser.user_id,
              email: otherUser.email,
              last_seen_at: unseenPresenceIso,
              last_read_at: unseenPresenceIso,
            },
          ],
          {
            onConflict: "conversation_id,user_id",
            ignoreDuplicates: true,
          },
        );

        setConversationId(createdConversationId);
        setConversations((prev) => [
          ...prev,
          {
            id: createdConversationId,
            created_at: conversationData.created_at,
            users: [
              { id: userId, email: userEmail ?? "" },
              { id: otherUser.user_id, email: otherUser.email ?? "" },
            ],
            type: "private",
          },
        ]);
        setUnreadCountByConversationId((prev) => ({
          ...prev,
          [createdConversationId]: 0,
        }));
        setParticipantMetaByConversationId((prev) => ({
          ...prev,
          [createdConversationId]: {
            last_seen_at: timestamp,
            last_read_at: timestamp,
          },
        }));

        setShowModal(false);
      } finally {
        creatingRef.current = false;
      }
    },
    [
      conversations,
      creatingRef,
      setConversationId,
      setConversations,
      setParticipantMetaByConversationId,
      setShowModal,
      setUnreadCountByConversationId,
      supabase,
      unseenPresenceIso,
      userEmail,
      userId,
    ],
  );

  const openPrivateChatFromGlobalProfile = useCallback(
    (targetUserId: string, targetEmail: string) => {
      if (!targetUserId || targetUserId === userId) return;
      if (!targetEmail) {
        toast.info("Cannot start a private chat without user email.");
        return;
      }

      void createConversation({ user_id: targetUserId, email: targetEmail });
    },
    [createConversation, userId],
  );

  const handleDeleteConversation = useCallback(async () => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", conversationId);

      if (error) throw error;

      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      setUnreadCountByConversationId((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
      setParticipantMetaByConversationId((prev) => {
        const next = { ...prev };
        delete next[conversationId];
        return next;
      });
      setConversationId(null);
      setShowRightSidebar(false);
      toast.success("Conversation deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete conversation");
    }
  }, [
    conversationId,
    setConversationId,
    setConversations,
    setParticipantMetaByConversationId,
    setShowRightSidebar,
    setUnreadCountByConversationId,
    supabase,
  ]);

  return {
    createConversation,
    openPrivateChatFromGlobalProfile,
    handleDeleteConversation,
  };
}