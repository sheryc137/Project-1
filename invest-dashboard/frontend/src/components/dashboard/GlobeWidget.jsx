import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

const NEWS_PINS = [
  { top: '20%', left: '22%', label: 'Americas' },
  { top: '28%', left: '48%', label: 'Europe' },
  { top: '32%', left: '62%', label: 'Asia' },
  { top: '55%', left: '55%', label: 'SE Asia' },
  { top: '18%', left: '70%', label: 'China' },
  { top: '60%', left: '25%', label: 'S. America' },
  { top: '45%', left: '48%', label: 'Africa' },
];

const riskColor = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

export default function GlobeWidget({ riskLevel = 'LOW', articleCount = 0, activeRegions = [] }) {
  const color = riskColor[riskLevel] || riskColor.LOW;
  const [tick, setTick] = useState(0);

  // Pulse tick for pin animations
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card flex flex-col items-center justify-center py-6 relative overflow-hidden">
      <p className="card-header mb-4 text-center">Global News Monitor</p>

      {/* Globe container */}
      <div className="relative w-48 h-48">
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-xl animate-pulse"
          style={{ background: color }}
        />

        {/* Globe sphere */}
        <div
          className="absolute inset-2 rounded-full overflow-hidden border-2 shadow-2xl"
          style={{ borderColor: `${color}40` }}
        >
          {/* Rotating surface */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 35% 35%, #1e3a5f 0%, #0f172a 60%, #020617 100%)`,
              animation: 'spin 20s linear infinite',
            }}
          >
            {/* Latitude lines */}
            {[25, 45, 65, 82].map((top) => (
              <div
                key={top}
                className="absolute w-full border-t border-blue-900/40"
                style={{ top: `${top}%` }}
              />
            ))}
            {/* Longitude lines */}
            {[20, 40, 60, 80].map((left) => (
              <div
                key={left}
                className="absolute h-full border-l border-blue-900/40"
                style={{ left: `${left}%` }}
              />
            ))}
            {/* Landmass blobs */}
            <div className="absolute bg-slate-700/60 rounded-full" style={{ top: '20%', left: '18%', width: '28%', height: '22%' }} />
            <div className="absolute bg-slate-700/60 rounded-full" style={{ top: '25%', left: '50%', width: '22%', height: '28%' }} />
            <div className="absolute bg-slate-700/60 rounded-full" style={{ top: '15%', left: '62%', width: '25%', height: '30%' }} />
            <div className="absolute bg-slate-700/60 rounded-full" style={{ top: '55%', left: '22%', width: '15%', height: '20%' }} />
            <div className="absolute bg-slate-700/60 rounded-full" style={{ top: '48%', left: '45%', width: '18%', height: '16%' }} />
          </div>

          {/* Globe shine */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.08) 0%, transparent 60%)',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* News pins */}
        {NEWS_PINS.map((pin, i) => {
          const isActive = articleCount > 0 || activeRegions.includes(pin.label);
          const pulsing = tick % NEWS_PINS.length === i;
          return (
            <div
              key={pin.label}
              className="absolute flex items-center justify-center"
              style={{ top: pin.top, left: pin.left, transform: 'translate(-50%, -50%)' }}
            >
              {isActive && (
                <div
                  className={clsx(
                    'w-2.5 h-2.5 rounded-full border',
                    pulsing ? 'animate-ping' : ''
                  )}
                  style={{
                    background: color,
                    borderColor: color,
                    boxShadow: `0 0 6px ${color}`,
                    opacity: pulsing ? 1 : 0.6,
                  }}
                />
              )}
              {!isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              )}
            </div>
          );
        })}

        {/* Center exclamation for HIGH/CRITICAL */}
        {(riskLevel === 'HIGH' || riskLevel === 'CRITICAL') && (
          <div
            className="absolute inset-0 flex items-center justify-center text-2xl font-black animate-bounce"
            style={{ color, textShadow: `0 0 20px ${color}` }}
          >
            !
          </div>
        )}
      </div>

      {/* Stats below globe */}
      <div className="flex gap-6 mt-5 text-center">
        <div>
          <p className="text-2xl font-bold" style={{ color }}>{articleCount}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Articles</p>
        </div>
        <div className="w-px bg-slate-700" />
        <div>
          <p className="text-2xl font-bold" style={{ color }}>{riskLevel}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Risk</p>
        </div>
        <div className="w-px bg-slate-700" />
        <div>
          <p className="text-2xl font-bold text-slate-100">{NEWS_PINS.filter((_, i) => articleCount > i).length}</p>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Regions</p>
        </div>
      </div>

      {/* Spinning CSS keyframes injected inline */}
      <style>{`
        @keyframes spin {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
