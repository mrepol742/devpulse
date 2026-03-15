"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "../../lib/supabase/client";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Leaderboard = {
  id: string;
  name: string;
  description: string;
  slug: string;
};

export default function LeaderboardHeader({
  leaderboard,
  isOwner,
}: {
  leaderboard: { id: string; name: string; description: string };
  isOwner: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(leaderboard.name);
  const [description, setDescription] = useState(leaderboard.description || "");

  const handleEdit = async () => {
    const editLeaderboard: Promise<Leaderboard> = new Promise(
      async (resolve, reject) => {
        try {
          const supabase = await createClient();
          const slug = name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]+/g, "");

          const { data, error } = await supabase
            .from("leaderboards")
            .update({ name, slug, description })
            .eq("id", leaderboard.id)
            .select()
            .single();

          if (error) return reject(error);
          resolve(data);
        } catch (error) {
          reject(error);
        }
      },
    );

    toast.promise(editLeaderboard, {
      pending: "Editing leaderboard...",
      success: "Leaderboard updated!",
      error: {
        render({ data }) {
          const err = data as Error;
          if (err?.code === "23505") {
            return "A leaderboard with that name already exists.";
          }
          return err?.message || "Failed to edit. Please try again.";
        },
      },
    });

    editLeaderboard.then((data) => {
      router.push(`/leaderboard/${data.slug}`);
    });
  };

  return (
    <>
      <div className="group relative mb-8">
        <div className="flex justify-center items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{leaderboard.name}</h1>

            <p className="text-gray-400 text-center">
              {leaderboard.description?.length > 0
                ? leaderboard.description
                : "No description available."}
            </p>
          </div>

          {isOwner && (
            <button
              onClick={() => setOpen(true)}
              className="ms-5 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faPencil} />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 rounded-2xl">
          <div className="bg-gray-900 border border-gray-700 p-8 w-[90%] max-w-md shadow-2xl rounded-2xl">
            <h3 className="text-xl font-semibold mb-4">Edit Leaderboard</h3>

            <input
              className="w-full h-11 px-4 rounded-lg bg-black/40 border border-gray-700
            focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              className="w-full h-11 px-4 rounded-lg bg-black/40 border border-gray-700
          focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="flex justify-between items-center gap-3">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleEdit}
                className="w-full py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
