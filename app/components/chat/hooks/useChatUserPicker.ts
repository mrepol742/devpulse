"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/app/supabase-types";
import type { ChatUser } from "@/app/components/Chat";

type UseChatUserPickerParams = {
  supabase: SupabaseClient<Database>;
  userId: string;
  showModal: boolean;
};

export function useChatUserPicker({
  supabase,
  userId,
  showModal,
}: UseChatUserPickerParams) {
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);

  useEffect(() => {
    if (!showModal) return;

    const fetchUsers = async () => {
      const { data } = await supabase
        .from("top_user_stats")
        .select("user_id, email")
        .neq("user_id", userId);

      if (!data) return;

      const users: ChatUser[] = data.filter(
        (user): user is { user_id: string; email: string } =>
          user.user_id !== null && user.email !== null,
      );

      setAllUsers(users);
    };

    void fetchUsers();
  }, [showModal, supabase, userId]);

  const filteredUsers = useMemo(
    () =>
      allUsers.filter((user) =>
        user.email.toLowerCase().includes(search.toLowerCase()),
      ),
    [allUsers, search],
  );

  return {
    search,
    setSearch,
    allUsers,
    filteredUsers,
  };
}