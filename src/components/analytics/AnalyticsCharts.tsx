import React, { useState } from 'react';

// =====================================================================
// APPLE-INSPIRED MINIMALIST ENTERPRISE CHARTS & VISUALIZERS
// =====================================================================

interface BarChartItem {
  label: string;
  value: number;
  secondaryValue?: number;
  sublabel?: string;
}

interface BarChartVisualizerProps {
  title: string;
  subtitle?: string;
  data: BarChartItem[];
  color?: 'indigo' | 'emerald' | 'amber' | 'slate';
  height?: number;
  unit?: string;
}

export const BarChartVisualizer: React.FC<BarChartVisualizerProps> = ({
  title,
  subtitle,
  data,
  color = 'indigo',
  height = 180,
  unit = 'jobs',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 10);

  const colorStyles = {
    indigo: {
      bar: 'bg-indigo-600 hover:bg-indigo-500',
      barSecondary: 'bg-indigo-200',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    },
    emerald: {
      bar: 'bg-emerald-600 hover:bg-emerald-500',
      barSecondary: 'bg-emerald-200',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    amber: {
      bar: 'bg-amber-500 hover:bg-amber-400',
      barSecondary: 'bg-amber-200',
      badge: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    slate: {
      bar: 'bg-slate-900 hover:bg-slate-800',
      barSecondary: 'bg-slate-200',
      badge: 'bg-slate-100 text-slate-800 border-slate-200',
    },
  }[color];

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{title}</h4>
          {subtitle && <p className="text-slate-400 text-xs font-semibold mt-0.5">{subtitle}</p>}
        </div>
        {hoveredIndex !== null && data[hoveredIndex] && (
          <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${colorStyles.badge}`}>
            {data[hoveredIndex].label}: {data[hoveredIndex].value.toLocaleString()} {unit}
          </span>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="pt-4 pb-2" style={{ height: `${height}px` }}>
        <div className="w-full h-full flex items-end justify-between gap-2 border-b border-slate-150 pb-2 relative">
          {/* Subtle horizontal grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-dashed border-slate-200 w-full" />
            <div className="border-b border-dashed border-slate-200 w-full" />
            <div className="border-b border-dashed border-slate-200 w-full" />
          </div>

          {data.map((item, idx) => {
            const heightPercent = Math.max(8, Math.round((item.value / maxValue) * 100));
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative z-10"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip on hover */}
                {isHovered && (
                  <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap z-30 animate-fadeIn">
                    {item.value.toLocaleString()} {unit}
                  </div>
                )}

                {/* Main Bar */}
                <div
                  className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${colorStyles.bar} ${
                    isHovered ? 'scale-x-105 shadow-md' : 'opacity-90'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Labels X Axis */}
        <div className="flex justify-between gap-2 mt-2">
          {data.map((item, idx) => (
            <div
              key={idx}
              className={`flex-1 text-center text-[10px] font-extrabold truncate transition-colors ${
                hoveredIndex === idx ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// LINE / AREA CHART VISUALIZER (SMOOTH SVG CURVE)
// =====================================================================

interface LineChartItem {
  label: string;
  value: number;
}

interface LineChartVisualizerProps {
  title: string;
  subtitle?: string;
  data: LineChartItem[];
  color?: string;
  height?: number;
  unit?: string;
}

export const LineChartVisualizer: React.FC<LineChartVisualizerProps> = ({
  title,
  subtitle,
  data,
  height = 180,
  unit = 'jobs',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value), 10);
  const paddingPct = 10;
  const svgWidth = 500;
  const svgHeight = 140;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * (svgWidth - 20) + 10;
    const y = svgHeight - (d.value / maxValue) * (svgHeight - 30) - 10;
    return { x, y, value: d.value, label: d.label };
  });

  // Construct smooth path string
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Closed path for SVG background area gradient fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight} L ${points[0].x} ${svgHeight} Z`;

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{title}</h4>
          {subtitle && <p className="text-slate-400 text-xs font-semibold mt-0.5">{subtitle}</p>}
        </div>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-mono font-black">
            {data[hoveredIdx].label}: {data[hoveredIdx].value.toLocaleString()} {unit}
          </span>
        )}
      </div>

      <div className="relative pt-2" style={{ height: `${height}px` }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1="20" x2={svgWidth} y2="20" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="0" y1="70" x2={svgWidth} y2="70" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />
          <line x1="0" y1="120" x2={svgWidth} y2="120" stroke="#f1f5f9" strokeDasharray="4 4" strokeWidth="1" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Main Line */}
          <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Interactive Data Nodes */}
          {points.map((p, idx) => (
            <g
              key={idx}
              className="cursor-pointer group"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIdx === idx ? '6' : '4'}
                fill={hoveredIdx === idx ? '#4f46e5' : '#ffffff'}
                stroke="#4f46e5"
                strokeWidth="2.5"
                className="transition-all duration-200"
              />
            </g>
          ))}
        </svg>

        {/* Labels X Axis */}
        <div className="flex justify-between gap-2 mt-2">
          {data.map((item, idx) => (
            <div
              key={idx}
              className={`flex-1 text-center text-[10px] font-extrabold truncate transition-colors ${
                hoveredIdx === idx ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// =====================================================================
// JOB STATUS DISTRIBUTION DONUT
// =====================================================================

interface DistributionProps {
  completed: number;
  pending: number;
  cancelled: number;
  rejected: number;
}

export const StatusDistributionVisualizer: React.FC<DistributionProps> = ({
  completed,
  pending,
  cancelled,
  rejected,
}) => {
  const total = completed + pending + cancelled + rejected || 1;
  const pct = (val: number) => Math.round((val / total) * 100);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">Status Breakdown</h4>
          <p className="text-slate-400 text-xs font-semibold mt-0.5">Job completion ratio</p>
        </div>
        <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-xl">
          {total.toLocaleString()} total
        </span>
      </div>

      {/* Progress Stack Bar */}
      <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        <div style={{ width: `${pct(completed)}%` }} className="bg-emerald-500 h-full" title={`Completed: ${completed}`} />
        <div style={{ width: `${pct(pending)}%` }} className="bg-amber-500 h-full" title={`Pending: ${pending}`} />
        <div style={{ width: `${pct(cancelled)}%` }} className="bg-slate-400 h-full" title={`Cancelled: ${cancelled}`} />
        <div style={{ width: `${pct(rejected)}%` }} className="bg-rose-500 h-full" title={`Rejected: ${rejected}`} />
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-extrabold">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <div>
            <span className="text-emerald-900 block">Completed</span>
            <span className="text-emerald-700 font-black text-sm">{completed} ({pct(completed)}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/60 border border-amber-100">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
          <div>
            <span className="text-amber-900 block">Pending</span>
            <span className="text-amber-700 font-black text-sm">{pending} ({pct(pending)}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
          <div>
            <span className="text-slate-800 block">Cancelled</span>
            <span className="text-slate-700 font-black text-sm">{cancelled} ({pct(cancelled)}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50/60 border border-rose-100">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <div>
            <span className="text-rose-900 block">Rejected</span>
            <span className="text-rose-700 font-black text-sm">{rejected} ({pct(rejected)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
