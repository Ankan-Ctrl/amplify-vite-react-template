import React from 'react';
import {
  Sale,
  Expense,
  Customer,
  Product,
  DateFilterRange,
  ActiveTab,
  BusinessSummary,
  MonthlyDataPoint,
  CategoryBreakdown,
  DecisionInsight,
} from '../../types';
import { MetricCard } from './MetricCard';
import { RevenueExpenseChart } from '../Charts/RevenueExpenseChart';
import { CategoryDonutChart } from '../Charts/CategoryDonutChart';
import { DecisionAssistant } from './DecisionAssistant';
import {
  DollarSign,
  TrendingDown,
  PieChart,
  Activity,
  AlertCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface OverviewTabProps {
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  products: Product[];
  dateRange: DateFilterRange;
  onDateRangeChange: (range: DateFilterRange) => void;
  summary: BusinessSummary;
  monthlyData: MonthlyDataPoint[];
  expenseCategories: CategoryBreakdown[];
  insights: DecisionInsight[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenSaleModal: () => void;
  onOpenExpenseModal: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  sales,
  products,
  dateRange,
  onDateRangeChange,
  summary,
  monthlyData,
  expenseCategories,
  insights,
  onNavigateTab,
  onOpenSaleModal,
  onOpenExpenseModal,
}) => {
  const recentSales = [...sales]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const lowStockProducts = products.filter((p) => p.stock <= p.lowStockThreshold);

  return (
    <div className="tab-content overview-tab">
      {/* Top Controls Bar */}
      <div className="overview-header-bar">
        <div>
          <h2 className="page-heading">Executive Performance Overview</h2>
          <p className="page-subheading">
            Live business health metrics, cash flows, and operational telemetry.
          </p>
        </div>

        <div className="overview-actions">
          {/* Time Filter Pills */}
          <div className="filter-pill-group">
            {(
              [
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: '90d', label: '90D' },
                { id: 'ytd', label: 'YTD' },
                { id: 'all', label: 'All Time' },
              ] as { id: DateFilterRange; label: string }[]
            ).map((pill) => (
              <button
                key={pill.id}
                className={`filter-pill ${dateRange === pill.id ? 'active' : ''}`}
                onClick={() => onDateRangeChange(pill.id)}
              >
                {pill.label}
              </button>
            ))}
          </div>

          <div className="action-buttons-group">
            <button className="btn btn-outline btn-sm" onClick={onOpenExpenseModal}>
              + Log Expense
            </button>
            <button className="btn btn-primary btn-sm" onClick={onOpenSaleModal}>
              + Record Sale
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="kpi-grid">
        <MetricCard
          title="Total Gross Revenue"
          value={`$${summary.totalRevenue.toLocaleString()}`}
          change={summary.revenueGrowthMoM}
          changePeriod="MoM growth rate"
          icon={DollarSign}
          iconColor="#29352D"
          iconBg="#F0EFE8"
          badgeText={`${summary.completedSalesCount} paid`}
          badgeVariant="success"
        />

        <MetricCard
          title="Operating Expenses"
          value={`$${summary.totalExpenses.toLocaleString()}`}
          change={summary.expenseGrowthMoM}
          changePeriod="MoM expense variance"
          icon={TrendingDown}
          iconColor="#963A3A"
          iconBg="#FBEBE9"
          badgeText="Active Run-rate"
          badgeVariant="warning"
        />

        <MetricCard
          title="Net Operating Profit"
          value={`$${summary.netProfit.toLocaleString()}`}
          subtitle={`Operating Margin: ${summary.profitMarginPercent.toFixed(1)}%`}
          icon={PieChart}
          iconColor="#295738"
          iconBg="#DCE7D7"
          badgeText={summary.profitMarginPercent >= 20 ? 'Healthy' : 'Moderate'}
          badgeVariant={summary.profitMarginPercent >= 20 ? 'success' : 'info'}
        />

        <MetricCard
          title="Pending Receivables"
          value={`$${summary.pendingSalesAmount.toLocaleString()}`}
          subtitle={`AOV: $${Math.round(summary.averageOrderValue).toLocaleString()}`}
          icon={Activity}
          iconColor="#875716"
          iconBg="#F6EDE0"
          badgeText={summary.pendingSalesAmount > 0 ? 'Action Req' : 'Zero Arrears'}
          badgeVariant={summary.pendingSalesAmount > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <RevenueExpenseChart data={monthlyData} />
        <CategoryDonutChart
          title="Operating Expenses by Category"
          subtitle="Expense distribution across active accounts"
          data={expenseCategories}
        />
      </div>

      {/* Decision Engine */}
      <DecisionAssistant insights={insights} onNavigateTab={onNavigateTab} />

      {/* Operational Widgets Row */}
      <div className="operational-widgets-grid">
        {/* Recent Transactions */}
        <div className="card widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <Clock size={18} className="widget-icon" />
              <div>
                <h4 className="widget-title">Recent Transactions</h4>
                <p className="widget-subtitle">Latest revenue postings and settlements</p>
              </div>
            </div>
            <button
              className="btn btn-ghost btn-xs widget-action"
              onClick={() => onNavigateTab('sales')}
            >
              <span>View All</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="widget-list">
            {recentSales.map((sale) => (
              <div key={sale.id} className="widget-list-item">
                <div className="item-left">
                  <span className="item-title">{sale.customerName}</span>
                  <span className="item-sub">
                    {sale.productName} &bull; {sale.date}
                  </span>
                </div>
                <div className="item-right">
                  <span className="item-amount">${sale.amount.toLocaleString()}</span>
                  <span
                    className={`status-pill pill-${
                      sale.status === 'COMPLETED'
                        ? 'completed'
                        : sale.status === 'PENDING'
                        ? 'pending'
                        : 'refunded'
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card widget-card">
          <div className="widget-header">
            <div className="widget-title-group">
              <AlertCircle size={18} className="widget-icon warning-icon" />
              <div>
                <h4 className="widget-title">Inventory Alerts</h4>
                <p className="widget-subtitle">Products at or below reorder threshold</p>
              </div>
            </div>
            <button
              className="btn btn-ghost btn-xs widget-action"
              onClick={() => onNavigateTab('inventory')}
            >
              <span>Manage Catalog</span>
              <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="widget-list">
            {lowStockProducts.length === 0 ? (
              <div className="empty-widget-state">
                All inventory levels are currently above reorder thresholds.
              </div>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="widget-list-item">
                  <div className="item-left">
                    <span className="item-title">{p.name}</span>
                    <span className="item-sub">
                      SKU: {p.sku} &bull; Category: {p.category}
                    </span>
                  </div>
                  <div className="item-right">
                    <div className="stock-alert-wrap">
                      <span className="stock-count alert-text">
                        {p.stock} in stock
                      </span>
                      <span className="stock-threshold">
                        Min: {p.lowStockThreshold}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
