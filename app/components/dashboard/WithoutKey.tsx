"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

export default function DashboardWithoutKey({ email }: { email: string }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const saveKey = async () => {
    setLoading(true);

    const saveKey = new Promise(async (resolve, reject) => {
      try {
        const wakatimeApiKeyRegex =
          /^waka_[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!key.trim() || !wakatimeApiKeyRegex.test(key))
          return reject(new Error("Please enter a valid WakaTime API key."));

        const isValid = await testApiKey(key);
        if (!isValid)
          return reject(
            new Error("Invalid API key. Please check and try again."),
          );

        resolve(isValid);
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(saveKey, {
      pending: "Please wait while we validate and save your API key...",
      success: "API key saved! Redirecting...",
      error: {
        render({ data }) {
          setLoading(false);
          const err = data as Error;
          return err?.message || "Failed to login. Please try again.";
        },
      },
    });

    saveKey.then(() => {
      router.refresh();
    });
  };

  const testApiKey = async (apiKey: string) => {
    const response = await fetch(
      `/api/wakatime/sync?=apiKey=${encodeURIComponent(apiKey)}`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
        },
      },
    );
    return response.ok;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-indigo-950 to-black text-white px-4">
      <div className="bg-white/5 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/10">
        <h2 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500">
          Connect WakaTime
        </h2>

        <p className="text-gray-400 mb-8 text-sm">
          Welcome <span className="text-white font-medium">{email}</span>. Enter
          your WakaTime API key to activate your DevPulse dashboard.
        </p>

        <input
          placeholder="Enter your WakaTime API Key"
          className="w-full p-3 mb-4 rounded-xl bg-black/40 border border-gray-700
                     focus:outline-none focus:ring-2 focus:ring-indigo-500
                     focus:border-indigo-500 transition"
          onChange={(e) => setKey(e.target.value)}
        />

        <button
          onClick={saveKey}
          disabled={loading}
          className={`w-full py-3 rounded-xl font-semibold transition-all duration-300
            ${
              loading
                ? "bg-gray-700 cursor-not-allowed opacity-70"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-500 hover:to-indigo-500 hover:scale-[1.02] shadow-lg"
            }`}
        >
          {loading ? "Saving..." : "Save API Key"}
        </button>

        <p className="mt-6 text-sm text-gray-400 leading-relaxed mb-3">
          You can get your WakaTime API key from your{" "}
          <Link
            href="https://wakatime.com/settings/account"
            target="_blank"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 transition"
          >
            account settings
          </Link>{" "}
          on WakaTime.
        </p>

        <Link
          href="/logout"
          className="ml-auto text-sm text-gray-400 hover:text-gray-300"
        >
          Logout
        </Link>
      </div>
    </div>
  );
}
