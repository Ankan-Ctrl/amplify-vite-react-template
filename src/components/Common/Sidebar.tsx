import React from 'react';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  DollarSign,
  TrendingDown,
  Users,
  Package,
  Cloud,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  onNavigateTab: (tab: ActiveTab) => void;
  lowStockCount: number;
  pendingSalesCount: number;
  onExportSalesCSV: () => void;
  onExportExpensesCSV: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigateTab,
  lowStockCount,
  pendingSalesCount,
  onExportSalesCSV,
  onExportExpensesCSV,
}) => {
  const navItems = [
    {
      id: 'overview' as ActiveTab,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'sales' as ActiveTab,
      label: 'Sales & Revenue',
      icon: DollarSign,
      badge: pendingSalesCount > 0 ? `${pendingSalesCount} open` : null,
      badgeType: 'warning',
    },
    {
      id: 'expenses' as ActiveTab,
      label: 'Operating Expenses',
      icon: TrendingDown,
      badge: null,
    },
    {
      id: 'customers' as ActiveTab,
      label: 'Customer Accounts',
      icon: Users,
      badge: null,
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Products & Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
      badgeType: 'danger',
    },
    {
      id: 'architecture' as ActiveTab,
      label: 'AWS Cloud Blueprint',
      icon: Cloud,
      badge: 'Cloud Docs',
      badgeType: 'info',
    },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-nav-list">
        <span className="sidebar-section-title">CORE MODULES</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigateTab(item.id)}
            >
              <div className="nav-item-left">
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`nav-badge badge-${item.badgeType || 'info'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer-tools">
        <span className="sidebar-section-title">DATA EXPORTS</span>
        <button
          className="sidebar-export-btn"
          onClick={onExportSalesCSV}
          title="Export Sales Ledger as CSV"
        >
          <FileSpreadsheet size={15} />
          <span>Export Sales CSV</span>
        </button>
        <button
          className="sidebar-export-btn"
          onClick={onExportExpensesCSV}
          title="Export Expenses as CSV"
        >
          <FileSpreadsheet size={15} />
          <span>Export Expenses CSV</span>
        </button>

        <div className="sidebar-demo-notice">
          <p className="notice-text">
            <strong>Demonstration Notice:</strong> Figures are illustrative sample business records for local PC review.
          </p>
        </div>
      </div>
    </aside>
  );
};
