import React, { useState } from 'react';
import { Product } from '../../types';
import { Search, Plus, Edit2, Trash2, AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface InventoryTabProps {
  products: Product[];
  onOpenProductModal: (product?: Product) => void;
  onDeleteProduct: (id: string) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  onOpenProductModal,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const totalInventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.lowStockThreshold).length;

  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="tab-content">
      {/* Top Header */}
      <div className="section-header-row">
        <div>
          <h2 className="page-heading">Products & Inventory Catalog</h2>
          <p className="page-subheading">
            Audit item pricing, profit margins, stock availability, and automatic replenishment triggers.
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onOpenProductModal()}>
            <Plus size={16} />
            <span>Add New Product / SKU</span>
          </button>
        </div>
      </div>

      {/* Mini Stat Ribbon */}
      <div className="mini-stat-ribbon">
        <div className="ribbon-card">
          <span className="ribbon-label">Total Inventory Valuation</span>
          <span className="ribbon-val text-success">
            ${totalInventoryValue.toLocaleString()}
          </span>
        </div>
        <div className="ribbon-card">
          <span className="ribbon-label">Reorder Alerts</span>
          <span className={`ribbon-val ${lowStockCount > 0 ? 'text-warning' : 'text-success'}`}>
            {lowStockCount} items below threshold
          </span>
        </div>
        <div className="ribbon-card">
          <span className="ribbon-label">Active SKUs</span>
          <span className="ribbon-val">{products.length} catalog items</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by SKU, product name, or category..."
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
        </div>
      </div>

      {/* Table */}
      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product / Service</th>
              <th>SKU & Category</th>
              <th>Unit Price</th>
              <th>Unit Cost</th>
              <th>Margin</th>
              <th>Stock Level</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  No products found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const marginPercent = p.price > 0 ? Math.round(((p.price - p.cost) / p.price) * 100) : 0;
                const isLowStock = p.stock <= p.lowStockThreshold;

                return (
                  <tr key={p.id}>
                    <td className="cell-product-main">
                      <div className="product-title-row">
                        <Package size={15} className="text-muted" />
                        <span className="font-medium">{p.name}</span>
                      </div>
                      {p.description && <div className="product-subtext">{p.description}</div>}
                    </td>
                    <td>
                      <div className="sku-tag">{p.sku}</div>
                      <span className="category-subtag">{p.category}</span>
                    </td>
                    <td className="cell-amount">
                      <strong>${p.price.toLocaleString()}</strong>
                    </td>
                    <td className="cell-cost text-muted">${p.cost.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${marginPercent >= 50 ? 'badge-success' : 'badge-info'}`}>
                        {marginPercent}%
                      </span>
                    </td>
                    <td className="cell-stock">
                      <div className="stock-meter-wrap">
                        <div className="stock-info-row">
                          <span className={`stock-number ${isLowStock ? 'text-danger font-bold' : ''}`}>
                            {p.stock} units
                          </span>
                          {isLowStock ? (
                            <span className="badge badge-warning flex-align">
                              <AlertTriangle size={11} />
                              <span>Low Stock</span>
                            </span>
                          ) : (
                            <span className="badge badge-success flex-align">
                              <CheckCircle size={11} />
                              <span>Optimal</span>
                            </span>
                          )}
                        </div>
                        <div className="progress-bar-bg">
                          <div
                            className={`progress-bar-fill ${isLowStock ? 'fill-warning' : 'fill-primary'}`}
                            style={{
                              width: `${Math.min(100, Math.max(10, (p.stock / (p.lowStockThreshold * 3)) * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="text-right cell-actions">
                      <button
                        className="btn-icon"
                        title="Edit Product"
                        onClick={() => onOpenProductModal(p)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn-icon btn-icon-danger"
                        title="Delete Product"
                        onClick={() => {
                          if (window.confirm(`Delete product "${p.name}"?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
