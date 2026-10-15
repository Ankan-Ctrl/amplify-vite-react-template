import React, { useState } from 'react';
import { MonthlyDataPoint } from '../../types';

interface RevenueExpenseChartProps {
  data: MonthlyDataPoint[];
}

export const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({ data }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="chart-empty">No trend data available</div>;
  }

  // Find max value for scaling
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.revenue, d.expenses, Math.abs(d.profit))),
    1000
  );
  const chartHeight = 220;
  const chartWidth = 560;
  const paddingX = 45;
  const paddingY = 25;
  const usableHeight = chartHeight - paddingY * 2;
  const usableWidth = chartWidth - paddingX * 2;
  const stepX = usableWidth / (data.length - 1 || 1);

  // Generate coordinate points for lines
  const revPoints = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + usableHeight - (d.revenue / maxValue) * usableHeight;
    return { x, y, val: d.revenue };
  });

  const expPoints = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + usableHeight - (d.expenses / maxValue) * usableHeight;
    return { x, y, val: d.expenses };
  });

  const profitPoints = data.map((d, i) => {
    const x = paddingX + i * stepX;
    const y = paddingY + usableHeight - (Math.max(0, d.profit) / maxValue) * usableHeight;
    return { x, y, val: d.profit };
  });

  const revPath = revPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const expPath = expPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const profitPath = profitPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Subtle clean area fill under revenue
  const revAreaPath = `${revPath} L ${revPoints[revPoints.length - 1].x} ${chartHeight - paddingY} L ${revPoints[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Revenue vs Operating Expenses</h3>
          <p className="chart-subtitle">Monthly financial trajectory & net profitability</p>
        </div>
        <div className="chart-legend">
          <span className="legend-item">
            <span className="legend-dot dot-revenue"></span> Revenue
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-expense"></span> Expenses
          </span>
          <span className="legend-item">
            <span className="legend-dot dot-profit"></span> Net Profit
          </span>
        </div>
      </div>

      <div className="svg-container">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="interactive-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#29352D" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#29352D" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + usableHeight * (1 - pct);
            const val = Math.round(maxValue * pct);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="#E2E3DC"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="#7C8B80"
                  fontSize="10"
                  fontFamily="sans-serif"
                  textAnchor="end"
                >
                  ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Subtle area fill */}
          <path d={revAreaPath} fill="url(#revGrad)" />

          {/* Lines */}
          <path d={revPath} fill="none" stroke="#29352D" strokeWidth="2.2" />
          <path d={expPath} fill="none" stroke="#A85344" strokeWidth="2.2" strokeDasharray="4 2" />
          <path d={profitPath} fill="none" stroke="#3E6948" strokeWidth="1.8" />

          {/* Data Points & Hover Targets */}
          {data.map((d, i) => {
            const pRev = revPoints[i];
            const pExp = expPoints[i];
            const isHovered = hoveredIndex === i;

            return (
              <g key={i}>
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={pRev.x}
                    y1={paddingY}
                    x2={pRev.x}
                    y2={chartHeight - paddingY}
                    stroke="#A8B5AB"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                )}

                {/* Circles */}
                <circle
                  cx={pRev.x}
                  cy={pRev.y}
                  r={isHovered ? 4.5 : 3}
                  fill="#29352D"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                <circle
                  cx={pExp.x}
                  cy={pExp.y}
                  r={isHovered ? 4.5 : 3}
                  fill="#A85344"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />

                {/* X-axis labels */}
                <text
                  x={pRev.x}
                  y={chartHeight - 6}
                  fill={isHovered ? '#29352D' : '#7C8B80'}
                  fontSize="11"
                  fontWeight={isHovered ? '600' : 'normal'}
                  fontFamily="sans-serif"
                  textAnchor="middle"
                >
                  {d.month}
                </text>

                {/* Hover trigger column */}
                <rect
                  x={pRev.x - stepX / 2}
                  y={0}
                  width={stepX}
                  height={chartHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIndex !== null && data[hoveredIndex] && (
          <div
            className="chart-tooltip"
            style={{
              left: `${Math.min(75, Math.max(5, (hoveredIndex / (data.length - 1)) * 75 + 5))}%`,
              top: '15px',
            }}
          >
            <div className="tooltip-title">{data[hoveredIndex].month} 2026</div>
            <div className="tooltip-row">
              <span className="dot dot-revenue"></span> Revenue:{' '}
              <strong className="tabular-nums">${data[hoveredIndex].revenue.toLocaleString()}</strong>
            </div>
            <div className="tooltip-row">
              <span className="dot dot-expense"></span> Expenses:{' '}
              <strong className="tabular-nums">${data[hoveredIndex].expenses.toLocaleString()}</strong>
            </div>
            <div className="tooltip-row">
              <span className="dot dot-profit"></span> Net Margin:{' '}
              <strong
                className="tabular-nums"
                style={{ color: data[hoveredIndex].profit >= 0 ? '#295738' : '#963A3A' }}
              >
                ${data[hoveredIndex].profit.toLocaleString()}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
