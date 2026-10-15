import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { Search, Plus, Download, Edit2, Trash2, Repeat, Receipt } from 'lucide-react';

interface ExpensesTabProps {
  expenses: Expense[];
  onOpenExpenseModal: (expense?: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onExportCSV: () => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  expenses,
  onOpenExpenseModal,
  onDeleteExpense,
  onExportCSV,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [recurringFilter, setRecurringFilter] = useState<string>('ALL');

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;

    const matchesRecurring =
      recurringFilter === 'ALL' ||
      (recurringFilter === 'RECURRING' && e.isRecurring) ||
      (recurringFilter === 'ONE_TIME' && !e.isRecurring);

    return matchesSearch && matchesCategory && matchesRecurring;
  });

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const recurringAmount = expenses
    .filter((e) => e.isRecurring)
    .reduce((sum, e) => sum + e.amount, 0);

  const categories: ExpenseCategory[] = [
    'Software',
    'Payroll',
    'Operations',
    'Marketing',
    'Inventory',
    'Utilities',
  ];

  return (
    <div className="tab-content">
      {/* Top Header */}
      <div className="section-header-row">
        <div>
          <h2 className="page-heading">Operating Expenses & Cost Ledger</h2>
          <p className="page-subheading">
            Audit overhead, vendor liabilities, recurring SaaS subscriptions, and inventory replenishment.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-outline btn-sm" onClick={onExportCSV}>
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenExpenseModal()}>
            <Plus size={16} />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* Mini Stat Ribbon */}
      <div className="mini-stat-ribbon">
        <div className="ribbon-card">
          <span className="ribbon-label">Total Outflow</span>
          <span className="ribbon-val text-danger">
            ${totalExpenseAmount.toLocaleString()}
          </span>
        </div>
        <div className="ribbon-card">
          <span className="ribbon-label">Fixed Recurring Commitments</span>
          <span className="ribbon-val text-warning">
            ${recurringAmount.toLocaleString()}/mo
          </span>
        </div>
        <div className="ribbon-card">
          <span className="ribbon-label">Active Expense Entries</span>
          <span className="ribbon-val">{expenses.length} entries</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by description, vendor, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-select-group">
          <select
            className="select-input"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="select-input"
            value={recurringFilter}
            onChange={(e) => setRecurringFilter(e.target.value)}
          >
            <option value="ALL">All Frequencies</option>
            <option value="RECURRING">Recurring (Monthly)</option>
            <option value="ONE_TIME">One-Time Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Vendor</th>
              <th>Frequency</th>
              <th>Amount</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  No expense records match the current filters.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="cell-date">{expense.date}</td>
                  <td className="cell-desc">
                    <span className="font-medium">{expense.description}</span>
                  </td>
                  <td>
                    <span className="category-tag tag-expense">{expense.category}</span>
                  </td>
                  <td className="cell-vendor">
                    <div className="vendor-wrap">
                      <Receipt size={13} className="text-muted" />
                      <span>{expense.vendor || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    {expense.isRecurring ? (
                      <span className="badge badge-info flex-align">
                        <Repeat size={11} />
                        <span>Recurring</span>
                      </span>
                    ) : (
                      <span className="badge badge-neutral">One-time</span>
                    )}
                  </td>
                  <td className="cell-amount text-danger">
                    <strong>${expense.amount.toLocaleString()}</strong>
                  </td>
                  <td className="text-right cell-actions">
                    <button
                      className="btn-icon"
                      title="Edit Expense"
                      onClick={() => onOpenExpenseModal(expense)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      title="Delete Expense"
                      onClick={() => {
                        if (window.confirm(`Delete expense "${expense.description}"?`)) {
                          onDeleteExpense(expense.id);
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
