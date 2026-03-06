"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createClient } from "../lib/supabase/client";
import Link from "next/link";
import { useState } from "react";
import { faKey, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

export default function BoardList({
  board,
}: {
  board: { id: string; name: string; slug: string; join_code: string };
}) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    const supabase = await createClient();
    const { error } = await supabase
      .from("leaderboards")
      .delete()
      .eq("id", board.id);

    if (error)
      return toast.error("Failed to delete leaderboard. Please try again.");

    setShowDeleteModal(false);
    window.location.reload();
  };

  return (
    <>
      <div
        key={board.id}
        className="p-4 rounded-xl bg-black/40 border border-gray-800 hover:border-indigo-500 transition"
      >
        <div className="flex justify-between items-center">
          <Link href={`/leaderboard/${board.slug}`} className="flex-1">
            <p className="font-medium hover:text-indigo-400">{board.name}</p>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-1.5 text-xs rounded-lg bg-gray-600 hover:bg-gray-500 transition mr-2"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <button
            onClick={() => {
              setSelectedCode(board.join_code);
              setShowCodeModal(true);
            }}
            className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 transition"
          >
            <FontAwesomeIcon icon={faKey} />
          </button>
        </div>
      </div>

      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-gray-900 border border-gray-700 p-8 w-[90%] max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">
              Leaderboard Join Code
            </h3>

            <div className="text-center text-3xl font-bold tracking-widest text-indigo-400 mb-6">
              {selectedCode}
            </div>

            <button
              onClick={() => setShowCodeModal(false)}
              className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
          <div className="bg-gray-900 border border-gray-700 p-8 w-[90%] max-w-md shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">
              Are you sure you want to delete this leaderboard?
            </h3>

            <div className="text-center text-3xl font-bold tracking-widest text-indigo-400 mb-6">
              {board.name}
            </div>

            <small className="text-red-400 italic">
              This action is irreversable.
            </small>

            <div className="flex justify-between items-center gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete()}
                className="w-full py-2 rounded-lg bg-red-500 hover:bg-red-400 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
