import { useState, useRef, useEffect, MouseEvent } from 'react';

// Interfaces
interface PieDataItem {
  label: string;
  value: number;
  color: string;
}

interface GrowthRow {
  year: number;
  invested: number;
  interest: number;
  total: number;
}

interface ChartsProps {
  pieData?: PieDataItem[];
  growthData?: GrowthRow[];
}

export function DonutChart({ data }: { data: PieDataItem[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const sanitizedData = (data || []).map(item => ({
    ...item,
    value: typeof item.value === 'number' && !isNaN(item.value) && isFinite(item.value) ? Math.max(0, item.value) : 0
  }));

  const total = sanitizedData.reduce((sum, item) => sum + item.value, 0);
  if (isNaN(total) || total <= 0) return <div className="text-center text-gray-500 py-6">No data to display</div>;
  
  const radius = 50;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * radius; // ~314.16
  
  let accumulatedPercent = 0;
  
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 p-4 bg-white rounded-xl border border-gray-100">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
          />
          {sanitizedData.map((item, index) => {
            const percentage = item.value / total;
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - (accumulatedPercent * circumference);
            accumulatedPercent += percentage;
            
            const isHovered = hoveredIndex === index;
            
            const safeStrokeLength = isNaN(strokeLength) || !isFinite(strokeLength) ? 0 : strokeLength;
            const safeStrokeOffset = isNaN(strokeOffset) || !isFinite(strokeOffset) ? circumference : strokeOffset;
            
            return (
              <circle
                key={index}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={`${safeStrokeLength} ${circumference}`}
                strokeDashoffset={safeStrokeOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total</span>
          <span className="text-lg font-bold text-gray-900">
            ${Math.round(total).toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {sanitizedData.map((item, index) => {
          const pct = ((item.value / total) * 100).toFixed(1);
          const isHovered = hoveredIndex === index;
          return (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                isHovered ? 'bg-gray-50' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900 block">${Math.round(item.value).toLocaleString()}</span>
                <span className="text-xs text-gray-400">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function GrowthAreaChart({ data }: { data: GrowthRow[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; active: boolean; data?: GrowthRow } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(500);
  
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width || 500);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);
  
  if (!data || data.length === 0) return null;
  
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  
  // Max Value for Y scaling
  const maxVal = Math.max(...data.map(d => d.total)) * 1.05 || 100;
  
  // Scale functions
  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };
  
  const getY = (val: number) => {
    return paddingTop + chartHeight - (val / maxVal) * chartHeight;
  };
  
  // Build area and line path strings
  let totalAreaPoints = `M ${getX(0)} ${getY(0)}`;
  let investedAreaPoints = `M ${getX(0)} ${getY(0)}`;
  
  let totalLinePoints = '';
  let investedLinePoints = '';
  
  data.forEach((d, idx) => {
    const x = getX(idx);
    const yTotal = getY(d.total);
    const yInvested = getY(d.invested);
    
    totalAreaPoints += ` L ${x} ${yTotal}`;
    investedAreaPoints += ` L ${x} ${yInvested}`;
    
    if (idx === 0) {
      totalLinePoints = `M ${x} ${yTotal}`;
      investedLinePoints = `M ${x} ${yInvested}`;
    } else {
      totalLinePoints += ` L ${x} ${yTotal}`;
      investedLinePoints += ` L ${x} ${yInvested}`;
    }
  });
  
  // Close the area paths to the baseline
  const baseLineY = paddingTop + chartHeight;
  totalAreaPoints += ` L ${getX(data.length - 1)} ${baseLineY} L ${getX(0)} ${baseLineY} Z`;
  investedAreaPoints += ` L ${getX(data.length - 1)} ${baseLineY} L ${getX(0)} ${baseLineY} Z`;
  
  // Mouse hover event handler
  const handleMouseMove = (e: MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Find closest index
    const relativeX = mouseX - paddingLeft;
    const pct = relativeX / chartWidth;
    let index = Math.round(pct * (data.length - 1));
    index = Math.max(0, Math.min(data.length - 1, index));
    
    const d = data[index];
    if (d) {
      setTooltip({
        x: getX(index),
        y: getY(d.total),
        active: true,
        data: d
      });
    }
  };
  
  const handleMouseLeave = () => {
    setTooltip(null);
  };
  
  // Y-axis ticks
  const yTicksCount = 4;
  const yTicks = Array.from({ length: yTicksCount + 1 }, (_, i) => (maxVal / yTicksCount) * i);
  
  return (
    <div ref={containerRef} className="w-full bg-white p-4 rounded-xl border border-gray-100 relative">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">Wealth Projections Over Time</h4>
        <div className="flex gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-600" />
            <span className="text-gray-600">Total Value</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-blue-200" />
            <span className="text-gray-600">Total Invested</span>
          </div>
        </div>
      </div>
      
      <svg
        width="100%"
        height={height}
        className="overflow-visible select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Y Gridlines & Labels */}
        {yTicks.map((tick, idx) => {
          const y = getY(tick);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#F3F4F6" strokeWidth={1} />
              <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] font-mono fill-gray-400">
                ${Math.round(tick).toLocaleString()}
              </text>
            </g>
          );
        })}
        
        {/* X Labels */}
        {data.map((d, idx) => {
          if (idx === 0 || idx === data.length - 1 || (data.length > 8 && idx % Math.floor(data.length / 5) === 0)) {
            return (
              <text key={idx} x={getX(idx)} y={height - paddingBottom + 18} textAnchor="middle" className="text-[10px] font-mono fill-gray-400">
                Yr {d.year}
              </text>
            );
          }
          return null;
        })}
        
        {/* Area paths */}
        <path d={totalAreaPoints} fill="url(#totalGrad)" opacity={0.12} />
        <path d={investedAreaPoints} fill="url(#investedGrad)" opacity={0.3} />
        
        {/* Line paths */}
        <path d={totalLinePoints} fill="none" stroke="#2563EB" strokeWidth={2.5} strokeLinecap="round" />
        <path d={investedLinePoints} fill="none" stroke="#93C5FD" strokeWidth={2} strokeLinecap="round" strokeDasharray="3 3" />
        
        {/* Active Tooltip Vertical Line and Dots */}
        {tooltip && tooltip.active && tooltip.data && (
          <g>
            <line x1={tooltip.x} y1={paddingTop} x2={tooltip.x} y2={baseLineY} stroke="#3B82F6" strokeWidth={1} strokeDasharray="2 2" />
            <circle cx={tooltip.x} cy={getY(tooltip.data.total)} r={5} fill="#2563EB" stroke="#FFFFFF" strokeWidth={1.5} />
            <circle cx={tooltip.x} cy={getY(tooltip.data.invested)} r={4} fill="#93C5FD" stroke="#FFFFFF" strokeWidth={1.5} />
          </g>
        )}
        
        {/* Gradients */}
        <defs>
          <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#93C5FD" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Floating HTML Tooltip */}
      {tooltip && tooltip.active && tooltip.data && (
        <div
          className="absolute z-10 bg-gray-900 text-white p-2.5 rounded-lg text-xs shadow-lg pointer-events-none border border-gray-800 flex flex-col gap-1"
          style={{
            left: `${Math.min(width - 160, Math.max(10, tooltip.x - 70))}px`,
            top: `${Math.max(10, tooltip.y - 85)}px`,
          }}
        >
          <span className="font-bold border-b border-gray-800 pb-1 mb-0.5 text-gray-300">Year {tooltip.data.year}</span>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Total Value:</span>
            <span className="font-semibold text-green-400">${Math.round(tooltip.data.total).toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Invested:</span>
            <span className="font-semibold text-blue-300">${Math.round(tooltip.data.invested).toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-400">Earnings:</span>
            <span className="font-semibold text-amber-400">${Math.round(tooltip.data.interest).toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
