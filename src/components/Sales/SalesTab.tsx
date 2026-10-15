import React, { useState } from 'react';
import { Sale, SaleStatus } from '../../types';
import {
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
} from 'lucide-react';

interface SalesTabProps {
  sales: Sale[];
  onOpenSaleModal: (sale?: Sale) => void;
  onDeleteSale: (id: string) => void;
  onExportCSV: () => void;
}

export const SalesTab: React.FC<SalesTabProps> = ({
  sales,
  onOpenSaleModal,
  onDeleteSale,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Filter sales
  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.category && sale.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || sale.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCompletedAmount = sales
    .filter((s) => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + s.amount, 0);

  const totalPendingAmount = sales
    .filter((s) => s.status === 'PENDING')
    .reduce((sum, s) => sum + s.amount, 0);

  const getStatusIcon = (status: SaleStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 size={13} />;
      case 'PENDING':
        return <Clock size={13} />;
      case 'REFUNDED':
        return <RotateCcw size={13} />;
    }
  };

  return (
    <div className="tab-content">
      {/* Top Header */}
      <div className="section-header-row">
        <div>
          <h2 className="page-heading">Sales & Revenue Ledger</h2>
          <p className="page-subheading">
            Track customer orders, invoices, payment milestones, and revenue recognition.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={onExportCSV}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenSaleModal()}>
            <Plus size={16} />
            <span>Record New Sale</span>
          </button>
        </div>
      </div>

      {/* Mini Stat Ribbon */}
      <div className="mini-stat-ribbon">
        <div className="ribbon-card">
          <span className="ribbon-label">Total Completed Revenue</span>
          <span className="ribbon-val text-success">
            ${totalCompletedAmount.toLocaleString()}
          </span>
        </div>
        <div className="ribbon-card">
          <span className="ribbon-label">Pending Receivables</span>
          <span className="ribbon-val text-warning">
            ${totalPendingAmount.toLocaleString()}
          </span>
        </div>
        <div className="ribbon-card">
          <span className="ribbon-label">Total Transactions</span>
          <span className="ribbon-val">{sales.length} records</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by customer, product, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          {['ALL', 'COMPLETED', 'PENDING', 'REFUNDED'].map((st) => (
            <button
              key={st}
              className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Product / Service</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="empty-table-cell">
                  No sales found matching the current filters.
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale.id}>
                  <td className="cell-date">{sale.date}</td>
                  <td className="cell-customer">
                    <span className="font-medium">{sale.customerName}</span>
                  </td>
                  <td className="cell-product">{sale.productName}</td>
                  <td>
                    <span className="category-tag">{sale.category || 'General'}</span>
                  </td>
                  <td className="cell-qty">{sale.quantity}</td>
                  <td className="cell-amount">
                    <strong>${sale.amount.toLocaleString()}</strong>
                  </td>
                  <td>
                    <span
                      className={`status-pill pill-${sale.status.toLowerCase()} flex-align`}
                    >
                      {getStatusIcon(sale.status)}
                      <span>{sale.status}</span>
                    </span>
                  </td>
                  <td className="text-right cell-actions">
                    <button
                      className="btn-icon"
                      title="Edit Sale"
                      onClick={() => onOpenSaleModal(sale)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      title="Delete Sale"
                      onClick={() => {
                        if (window.confirm(`Delete sale for ${sale.customerName}?`)) {
                          onDeleteSale(sale.id);
                        }
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
