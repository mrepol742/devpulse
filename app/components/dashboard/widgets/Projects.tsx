import { formatHours } from "@/app/utils/time";
import { StatsData } from "../Stats";

export default function Projects({ stats }: { stats: StatsData }) {
  return (
    <>
      {stats.projects ? (
        <>
          <div className="glass-card p-6" data-aos="fade-in">
            <h3 className="text-sm font-semibold text-white mb-4">Projects</h3>
            <div className="space-y-3">
              {stats.projects.slice(0, 4).map((project, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base opacity-70"></span>
                    <span className="text-sm text-gray-300 font-medium">
                      {project.name}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full font-semibold">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatHours(project.total_seconds)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div>
          <div
            className="glass-card p-6 flex items-center justify-center"
            data-aos="fade-in"
          >
            <p className="text-sm text-gray-500">No project data available.</p>
          </div>
        </div>
      )}
    </>
  );
}
