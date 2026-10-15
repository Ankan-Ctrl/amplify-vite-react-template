import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number; // percentage
  changePeriod?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'info' | 'danger';
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changePeriod = 'vs last month',
  icon: Icon,
  iconColor = '#29352D',
  iconBg = '#F0EFE8',
  badgeText,
  badgeVariant = 'info',
  subtitle,
}) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isNeutral = change !== undefined && change === 0;

  return (
    <div className="card metric-card">
      <div className="metric-top">
        <div className="metric-header-info">
          <span className="metric-title">{title}</span>
          <div className="metric-value-row">
            <h2 className="metric-value">{value}</h2>
            {badgeText && (
              <span className={`badge badge-${badgeVariant}`}>
                {badgeText}
              </span>
            )}
          </div>
        </div>
        <div className="metric-icon-wrap" style={{ backgroundColor: iconBg, color: iconColor }}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
      </div>

      <div className="metric-footer">
        {change !== undefined ? (
          <div className="metric-trend">
            <span
              className={`trend-indicator ${
                isPositive ? 'trend-up' : isNegative ? 'trend-down' : 'trend-neutral'
              }`}
            >
              {isPositive && <TrendingUp size={14} className="trend-icon" />}
              {isNegative && <TrendingDown size={14} className="trend-icon" />}
              {isNeutral && <Minus size={14} className="trend-icon" />}
              {Math.abs(change)}%
            </span>
            <span className="trend-period">{changePeriod}</span>
          </div>
        ) : subtitle ? (
          <span className="metric-subtitle">{subtitle}</span>
        ) : null}
      </div>
    </div>
  );
};
