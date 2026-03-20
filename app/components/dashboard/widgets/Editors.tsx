import { formatHours } from "@/app/utils/time";
import { getDevIcon } from "../../DevIcon";
import { StatsData } from "../Stats";

export default function Editors({ stats }: { stats: StatsData }) {
  return (
    <>
      <div className="glass-card p-6" data-aos="fade-in">
        <h3 className="text-sm font-semibold text-white mb-4">Editors</h3>
        <div className="space-y-3">
          {stats.editors.slice(0, 4).map((editor, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base opacity-70">
                  {getDevIcon(editor.name)}
                </span>
                <span className="text-sm text-gray-300 font-medium">
                  {editor.name}
                </span>
                {idx === 0 && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-semibold">
                    PRIMARY
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500 font-mono">
                {formatHours(editor.total_seconds)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
