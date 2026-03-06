"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import Link from "next/link";
import { describe } from "node:test";

export default function DashboardWithKey({ email }: { email: string }) {
  const supabase = createClient();
  const [leaderboardName, setLeaderboardName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const createLeaderboard = async () => {
    if (leaderboardName.trim().length === 0)
      return toast.error("Please enter a leaderboard name.");
    if (leaderboardName.trim().length < 3)
      return toast.error("Leaderboard name must be at least 3 characters.");
    if (leaderboardName.length > 50)
      return toast.error("Leaderboard name must be under 50 characters.");

    const createLeaderboard = new Promise(async (resolve, reject) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;

        if (!user) return;

        const joinCode = crypto.randomUUID().slice(0, 8);
        const slug = leaderboardName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w-]+/g, "");

        const { data, error } = await supabase
          .from("leaderboards")
          .insert({
            name: leaderboardName,
            description: "",
            slug,
            owner_id: user.id,
            join_code: joinCode,
            is_public: true,
          })
          .select()
          .single();

        if (error) return reject(error);

        // Automatically add creator as member
        await supabase.from("leaderboard_members").insert({
          leaderboard_id: data.id,
          user_id: user.id,
          role: "owner",
        });

        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(createLeaderboard, {
      pending: "Creating leaderboard...",
      success: {
        render() {
          window.location.reload();
          return "Leaderboard created!";
        },
      },
      error: {
        render({ data }) {
          const err = data as Error;
          if (err?.code === "23505") {
            return "A leaderboard with that name already exists.";
          }
          return err?.message || "Failed to create. Please try again.";
        },
      },
    });
  };

  const joinLeaderboard = async () => {
    if (joinCode.trim().length === 0)
      return toast.error("Please enter a join code.");
    if (joinCode.trim().length !== 8)
      return toast.error("Join code must be 8 characters long.");

    const joinLeaderboard = new Promise(async (resolve, reject) => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        const user = userData.user;
        if (!user) return;

        const { data: board } = await supabase
          .from("leaderboards")
          .select("id")
          .eq("join_code", joinCode)
          .single();

        if (!board) throw new Error("Invalid join code");

        const { error } = await supabase.from("leaderboard_members").insert({
          leaderboard_id: board.id,
          user_id: user.id,
        });

        if (error) return reject(error);

        resolve(board);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(joinLeaderboard, {
      pending: "Joining leaderboard...",
      success: {
        render() {
          window.location.reload();
          return "Joined leaderboard!";
        },
      },
      error: {
        render({ data }) {
          const err = data as Error;
          if (err?.code === "23505") {
            return "You are already a member of this leaderboard.";
          }
          return err?.message || "Failed to join. Please try again.";
        },
      },
    });
  };

  return (
    <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Logged in as <span className="text-indigo-400">{email}</span>
          </p>
        </div>

        <Link
          href="/logout"
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Logout
        </Link>
      </div>

      {/* Create Leaderboard */}
      <div className="space-y-4 mb-8">
        <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">
          Create Leaderboard
        </h3>

        <input
          placeholder="Leaderboard name"
          className="w-full h-11 px-4 rounded-lg bg-black/40 border border-gray-700
          focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          onChange={(e) => setLeaderboardName(e.target.value)}
        />

        <button
          onClick={createLeaderboard}
          className="w-full h-11 rounded-lg font-medium
          bg-gradient-to-r from-indigo-500 to-purple-600
          hover:brightness-110 transition shadow-md"
        >
          Create
        </button>
      </div>

      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-gray-500 text-xs uppercase">or</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>

      {/* Join */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
          Join Leaderboard
        </h3>

        <input
          placeholder="Join code"
          className="w-full h-11 px-4 rounded-lg bg-black/40 border border-gray-700
          focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          onChange={(e) => setJoinCode(e.target.value)}
        />

        <button
          onClick={joinLeaderboard}
          className="w-full h-11 rounded-lg font-medium
          bg-gray-800 hover:bg-gray-700 transition"
        >
          Join
        </button>
      </div>
    </div>
  );
}
