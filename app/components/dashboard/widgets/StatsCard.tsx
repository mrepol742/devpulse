export interface StatCard {
  label: string;
  value: string;
  sub: string;
  trend: string;
  trendUp: boolean;
  color: string;
  progress: number; // 0 to 100
}

export default function StatsCard({
  statCards,
  animated,
  setAnimated,
}: {
  statCards: StatCard[];
  animated: boolean;
  setAnimated: (val: boolean) => void;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={card.label}
            className="glass-card p-5 group"
            data-aos="fade-up"
            data-aos-delay={idx * 100}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                {card.label}
              </p>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${card.color}15`,
                  color: card.color,
                }}
              >
                {card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-xs text-gray-600">{card.sub}</p>
            {/* Mini bar */}
            <div
              className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden cursor-pointer"
              role="button"
              onClick={() => {
                setAnimated(false);
                setTimeout(() => setAnimated(true), 10);
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-[2000ms] ease-in-out"
                style={{
                  width: animated ? `${card.progress}%` : "0%",
                  background: card.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
