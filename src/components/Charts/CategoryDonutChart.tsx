import React, { useState } from 'react';
import { CategoryBreakdown } from '../../types';

interface CategoryDonutChartProps {
  title: string;
  subtitle: string;
  data: CategoryBreakdown[];
  currencyPrefix?: string;
}

// Cohesive editorial palette avoiding rainbow or purple neon gradients
const PALETTE = [
  '#29352D', // Charcoal
  '#3E6948', // Deep Forest Sage
  '#6D8E76', // Mid Sage
  '#9CB7A4', // Light Sage
  '#8C6354', // Terracotta / Earth
  '#6C7E72', // Slate Sage
  '#A39182', // Warm Taupe
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  title,
  subtitle,
  data,
  currencyPrefix = '$',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const total = data.reduce((acc, item) => acc + item.amount, 0);

  // SVG parameters
  const size = 180;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">{title}</h3>
          <p className="chart-subtitle">{subtitle}</p>
        </div>
      </div>

      <div className="donut-layout">
        <div className="donut-visual">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {total === 0 ? (
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke="#E2E3DC"
                strokeWidth={strokeWidth}
              />
            ) : (
              data.map((item, idx) => {
                const percent = item.amount / total;
                const strokeDasharray = `${circumference * percent} ${circumference * (1 - percent)}`;
                const strokeDashoffset = -circumference * accumulatedPercent;
                accumulatedPercent += percent;
                const color = PALETTE[idx % PALETTE.length];
                const isHovered = hoveredIdx === idx;

                return (
                  <circle
                    key={item.category}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHovered ? strokeWidth + 3 : strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(-90 ${center} ${center})`}
                    style={{
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                      opacity: hoveredIdx === null || hoveredIdx === idx ? 1 : 0.45,
                    }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  />
                );
              })
            )}

            {/* Inner Center Text */}
            <text
              x={center}
              y={center - 6}
              textAnchor="middle"
              fill="#7C8B80"
              fontSize="11"
              fontFamily="sans-serif"
            >
              Total Outflow
            </text>
            <text
              x={center}
              y={center + 14}
              textAnchor="middle"
              fill="#29352D"
              fontSize="15"
              fontWeight="700"
              fontFamily="sans-serif"
              className="tabular-nums"
            >
              {currencyPrefix}
              {Math.round(total).toLocaleString()}
            </text>
          </svg>
        </div>

        {/* Legend List */}
        <div className="donut-legend">
          {data.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const color = PALETTE[idx % PALETTE.length];

            return (
              <div
                key={item.category}
                className={`legend-row ${isHovered ? 'highlight' : ''}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                <div className="legend-label-group">
                  <span className="color-swatch" style={{ backgroundColor: color }} />
                  <span className="legend-name">{item.category}</span>
                </div>
                <div className="legend-values">
                  <span className="legend-amount">
                    {currencyPrefix}
                    {item.amount.toLocaleString()}
                  </span>
                  <span className="legend-pct">{item.percentage.toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
