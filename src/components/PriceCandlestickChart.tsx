import React, { useState, useMemo } from 'react';
import { NiftyDataPoint } from '../types';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
  Bar,
  Cell,
  ReferenceLine
} from 'recharts';
import { CandlestickChart as CandleIcon, TrendingUp, Maximize2, Shield, Eye, Layers } from 'lucide-react';

interface PriceChartProps {
  data: NiftyDataPoint[];
}

export const PriceCandlestickChart: React.FC<PriceChartProps> = ({ data }) => {
  const [chartType, setChartType] = useState<'candlestick' | 'area' | 'channel'>('candlestick');
  const [showSMA, setShowSMA] = useState(true);

  // Sort chronologically
  const chartData = useMemo(() => {
    const sorted = [...data].sort((a, b) => a.parsedDate.localeCompare(b.parsedDate));

    // Calculate 5-day SMA and 10-day SMA
    return sorted.map((item, idx) => {
      let sma5 = null;
      let sma10 = null;

      if (idx >= 4) {
        const slice5 = sorted.slice(idx - 4, idx + 1);
        const sum5 = slice5.reduce((acc, curr) => acc + curr.close, 0);
        sma5 = Math.round((sum5 / 5) * 100) / 100;
      }

      if (idx >= 9) {
        const slice10 = sorted.slice(idx - 9, idx + 1);
        const sum10 = slice10.reduce((acc, curr) => acc + curr.close, 0);
        sma10 = Math.round((sum10 / 10) * 100) / 100;
      }

      // For custom candlestick visualization in Recharts:
      // We can create a bar that starts at min(open, close) with height = abs(close - open)
      const candleMin = Math.min(item.open, item.close);
      const candleMax = Math.max(item.open, item.close);
      const candleBody = Math.max(Math.abs(item.close - item.open), 3); // min 3 points for display

      return {
        ...item,
        candleMin,
        candleMax,
        candleBody,
        sma5,
        sma10,
        wickHighLow: [item.low, item.high],
        rangeBand: [item.low, item.high]
      };
    });
  }, [data]);

  // Calculate Y-axis Domain padding
  const { minPrice, maxPrice } = useMemo(() => {
    if (chartData.length === 0) return { minPrice: 20000, maxPrice: 25000 };
    let min = Infinity;
    let max = -Infinity;
    chartData.forEach(d => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
    });
    return {
      minPrice: Math.floor(min - 150),
      maxPrice: Math.ceil(max + 150)
    };
  }, [chartData]);

  // Custom Candlestick shape component
  const CustomCandleBar = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload || x === undefined || y === undefined) return null;

    const isBullish = payload.close >= payload.open;
    const color = isBullish ? '#10b981' : '#f43f5e';

    // Calculate Y coordinates for High and Low wicks
    // In Recharts Y axis: top is 0 (max value), bottom is height (min value)
    const yScaleFactor = height / (payload.candleBody || 1);
    const wickTopY = y - (payload.high - payload.candleMax) * yScaleFactor;
    const wickBottomY = y + height + (payload.candleMin - payload.low) * yScaleFactor;
    const centerX = x + width / 2;

    return (
      <g key={`candle-${payload.id}`}>
        {/* Wick line */}
        <line
          x1={centerX}
          y1={isNaN(wickTopY) ? y : wickTopY}
          x2={centerX}
          y2={isNaN(wickBottomY) ? y + height : wickBottomY}
          stroke={color}
          strokeWidth={1.5}
        />
        {/* Candle Body */}
        <rect
          x={x + 1}
          y={y}
          width={Math.max(width - 2, 4)}
          height={Math.max(height, 2)}
          fill={isBullish ? '#10b981' : '#f43f5e'}
          stroke={color}
          rx={1}
        />
      </g>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const d: NiftyDataPoint & { sma5?: number; sma10?: number } = payload[0].payload;
      const isGreen = d.close >= d.open;
      const changePts = d.close - d.open;

      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 text-slate-100 p-3.5 rounded-xl shadow-xl text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">{d.date}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                isGreen ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isGreen ? 'BULLISH' : 'BEARISH'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
            <div>
              <span className="text-slate-400">Open:</span>{' '}
              <span className="font-semibold text-slate-200">₹{d.open.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400">Close:</span>{' '}
              <span className="font-bold text-slate-100">₹{d.close.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400">High:</span>{' '}
              <span className="font-semibold text-emerald-400">₹{d.high.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400">Low:</span>{' '}
              <span className="font-semibold text-rose-400">₹{d.low.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-2 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Day Return (O-C):</span>
              <span className={`font-bold ${changePts >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {changePts >= 0 ? '+' : ''}{changePts.toFixed(2)} pts ({d.openCloseReturn.toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Day Range (H-L):</span>
              <span className="font-semibold text-indigo-300">{d.dayRange.toFixed(2)} pts</span>
            </div>
            {d.gapPercent !== null && (
              <div className="flex justify-between">
                <span className="text-slate-400">Gap Open:</span>
                <span
                  className={`font-semibold ${
                    d.gapType === 'GapUp'
                      ? 'text-emerald-400'
                      : d.gapType === 'GapDown'
                      ? 'text-rose-400'
                      : 'text-slate-300'
                  }`}
                >
                  {d.gapType} ({d.gapPercent > 0 ? '+' : ''}{d.gapPercent.toFixed(2)}%)
                </span>
              </div>
            )}
            {d.sma5 && (
              <div className="flex justify-between text-[10px] text-amber-400 pt-1">
                <span>5 SMA:</span> <span>₹{d.sma5.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CandleIcon className="w-5 h-5 text-indigo-600" />
            NIFTY 50 Price Action & Moving Averages
          </h2>
          <p className="text-xs text-slate-500">
            Interactive OHLC visualization with support & resistance range bands
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Chart type selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-medium">
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                chartType === 'candlestick'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Candlesticks
            </button>
            <button
              onClick={() => setChartType('area')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                chartType === 'area'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Close Area
            </button>
            <button
              onClick={() => setChartType('channel')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                chartType === 'channel'
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High-Low Channel
            </button>
          </div>

          {/* Toggle Moving Averages */}
          <button
            onClick={() => setShowSMA(!showSMA)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition cursor-pointer ${
              showSMA
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>SMA Lines (5/10)</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'candlestick' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <YAxis
                domain={[minPrice, maxPrice]}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `₹${val}`}
                orientation="right"
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Candlestick body representing candleMin to candleMax */}
              <Bar dataKey="candleBody" shape={<CustomCandleBar />}>
                {chartData.map((entry) => (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={entry.close >= entry.open ? '#10b981' : '#f43f5e'}
                  />
                ))}
              </Bar>

              {/* Optional SMA Lines */}
              {showSMA && (
                <>
                  <Line
                    type="monotone"
                    dataKey="sma5"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="5 Day SMA"
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="sma10"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    name="10 Day SMA"
                    isAnimationActive={false}
                  />
                </>
              )}

              <Brush
                dataKey="date"
                height={28}
                stroke="#6366f1"
                fill="#f8fafc"
                tickFormatter={() => ''}
              />
            </ComposedChart>
          ) : chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis
                domain={[minPrice, maxPrice]}
                orientation="right"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `₹${val}`}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="close"
                stroke="#6366f1"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#areaGradient)"
              />
              {showSMA && (
                <>
                  <Line type="monotone" dataKey="sma5" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sma10" stroke="#10b981" strokeWidth={2} dot={false} />
                </>
              )}
              <Brush dataKey="date" height={28} stroke="#6366f1" fill="#f8fafc" tickFormatter={() => ''} />
            </AreaChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
              <YAxis
                domain={[minPrice, maxPrice]}
                orientation="right"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `₹${val}`}
                axisLine={{ stroke: '#cbd5e1' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="high" stroke="#10b981" strokeDasharray="3 3" fill="#10b98110" />
              <Area type="monotone" dataKey="low" stroke="#f43f5e" strokeDasharray="3 3" fill="#f43f5e10" />
              <Line type="monotone" dataKey="close" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 3 }} />
              <Brush dataKey="date" height={28} stroke="#6366f1" fill="#f8fafc" tickFormatter={() => ''} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend & Key Indicators Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            Bullish Candle (Close ≥ Open)
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-sm bg-rose-500 inline-block" />
            Bearish Candle (Close &lt; Open)
          </span>
          {showSMA && (
            <>
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <span className="w-3 h-0.5 bg-amber-500 inline-block" />
                5 SMA
              </span>
              <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                <span className="w-3 h-0.5 bg-indigo-600 inline-block" />
                10 SMA
              </span>
            </>
          )}
        </div>
        <span className="text-slate-400 text-[11px]">
          Use lower slider to zoom into specific date range
        </span>
      </div>
    </div>
  );
};
