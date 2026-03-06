"use client";

import { useEffect, useState } from "react";
import "devicon/devicon.min.css";

export default function Stats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/wakatime/sync").then(() => {
      fetch("/api/wakatime/me")
        .then((res) => res.json())
        .then((data) => {
          setStats(data);
          setLoading(false);
        });
    });
  }, []);

  return (
    <div className="w-full bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-8">
      <h3 className="text-lg font-semibold mb-6 text-indigo-400">
        Coding Stats (Last 7 Days)
      </h3>

      {loading && (
        <div className="flex items-center justify-center px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-orange"></div>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-xl bg-black/40 border border-white/5">
            <p className="text-xs text-yellow-400 uppercase font-semibold">
              Coding Time
            </p>
            <p className="text-xs text-gray-400 mb-1">Total Hours</p>
            <p className="text-2xl font-semibold">
              {(stats.total_seconds / 3600).toFixed(1)} hrs
            </p>
          </div>

          {stats.languages.slice(0, 2).map((lang: any, idx: number) => (
            <CardView
              key={lang.name}
              title="Top Language"
              lang={lang}
              index={idx}
            />
          ))}

          {stats.editors.slice(0, 1).map((lang: any, idx: number) => (
            <CardView
              key={lang.name}
              title="Top Editor"
              lang={lang}
              index={idx}
            />
          ))}

          {stats.operating_systems.slice(0, 1).map((lang: any, idx: number) => (
            <CardView key={lang.name} title="Top OS" lang={lang} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}

const CardView = ({
  title,
  lang,
  index,
}: {
  title: string;
  lang: any;
  index: number;
}) => {
  const getLanguageIcon = (lang: string, props = {}) => {
    if (!lang) return null;
    const name = lang.toLowerCase();
    const cls = `devicon-${name}-plain colored`;
    return <i className={cls} {...props} />;
  };

  return (
    <div className="p-5 rounded-xl bg-black/40 border border-white/5">
      {index === 0 && (
        <p className="text-xs text-yellow-400 uppercase font-semibold">
          {title}
        </p>
      )}
      <div className="flex gap-2 items-center mt-2">
        {getLanguageIcon(lang.name, { style: { fontSize: 28 } })}
        <div>
          <p className="text-sm text-gray-300">{lang.name}</p>
          <p className="text-xl font-semibold">
            {(lang.total_seconds / 3600).toFixed(1)} hrs
          </p>
        </div>
      </div>
    </div>
  );
};
