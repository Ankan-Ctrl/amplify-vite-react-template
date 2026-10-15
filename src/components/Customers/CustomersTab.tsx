import React, { useState } from 'react';
import { Customer, CustomerStatus } from '../../types';
import { Search, Plus, Edit2, Trash2, Mail, Phone, Building, Crown } from 'lucide-react';

interface CustomersTabProps {
  customers: Customer[];
  onOpenCustomerModal: (customer?: Customer) => void;
  onDeleteCustomer: (id: string) => void;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  customers,
  onOpenCustomerModal,
  onDeleteCustomer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalLifetimeValue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const vipCount = customers.filter((c) => c.status === 'VIP').length;

  const getTierBadge = (status: CustomerStatus) => {
    switch (status) {
      case 'VIP':
        return (
          <span className="badge badge-warning flex-align">
            <Crown size={12} />
            <span>VIP Partner</span>
          </span>
        );
      case 'Active':
        return <span className="badge badge-success">Active</span>;
      case 'Lead':
        return <span className="badge badge-info">Lead / Prospect</span>;
      case 'Inactive':
        return <span className="badge badge-neutral">Inactive</span>;
    }
  };

  return (
    <div className="tab-content">
      {/* Top Header */}
      <div className="section-header-row">
        <div>
          <h2 className="page-heading">Customer Directory & Accounts</h2>
          <p className="page-subheading">
            Manage enterprise accounts, contacts, customer tiers, and accumulated lifetime spend.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onOpenCustomerModal()}>
            <Plus size={16} />
            <span>Add New Customer</span>
          </button>
        </div>
      </div>

      {/* Mini Stat Ribbon */}
      <div className="mini-stat-ribbon">
        <div className="ribbon-card">
          <span className="ribbon-label">Total Accounts</span>
          <span className="ribbon-val">{customers.length}</span>
        </div>
        <div className="ribbon-card">
          <span className="ribbon-label">VIP Accounts (&gt;$7.5k)</span>
          <span className="ribbon-val text-warning">{vipCount}</span>
        </div>
        <div className="ribbon-card">
          <span className="ribbon-label">Cumulative Account Value</span>
          <span className="ribbon-val text-success">
            ${totalLifetimeValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by customer name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          {['ALL', 'VIP', 'Active', 'Lead', 'Inactive'].map((st) => (
            <button
              key={st}
              className={`filter-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st === 'ALL' ? 'All Accounts' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Client / Company</th>
              <th>Contact Details</th>
              <th>Status Tier</th>
              <th>Total Revenue</th>
              <th>Customer Since</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-table-cell">
                  No customers found matching the search criteria.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td className="cell-client">
                    <div className="client-avatar-row">
                      <div className="client-avatar">
                        {customer.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="client-company-row">
                          <Building size={12} className="text-muted" />
                          <span>{customer.company || 'Individual Client'}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="cell-contact">
                    <div className="contact-row">
                      <Mail size={12} className="text-muted" />
                      <a href={`mailto:${customer.email}`} className="contact-link">
                        {customer.email}
                      </a>
                    </div>
                    {customer.phone && (
                      <div className="contact-row">
                        <Phone size={12} className="text-muted" />
                        <span className="contact-phone">{customer.phone}</span>
                      </div>
                    )}
                  </td>
                  <td>{getTierBadge(customer.status)}</td>
                  <td className="cell-amount">
                    <strong>${(customer.totalSpent || 0).toLocaleString()}</strong>
                  </td>
                  <td className="cell-date">{customer.joinDate}</td>
                  <td className="text-right cell-actions">
                    <button
                      className="btn-icon"
                      title="Edit Customer"
                      onClick={() => onOpenCustomerModal(customer)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn-icon btn-icon-danger"
                      title="Delete Customer"
                      onClick={() => {
                        if (window.confirm(`Delete customer profile "${customer.name}"?`)) {
                          onDeleteCustomer(customer.id);
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
