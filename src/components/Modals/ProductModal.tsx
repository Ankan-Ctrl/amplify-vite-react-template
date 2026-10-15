import React, { useState } from 'react';
import { Product } from '../../types';
import { X, Package, Tag, DollarSign, Layers } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  initialProduct?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
}) => {
  const [name, setName] = useState(() => initialProduct?.name ?? '');
  const [sku, setSku] = useState(() => initialProduct?.sku ?? `SKU-${Math.floor(100 + Math.random() * 900)}`);
  const [category, setCategory] = useState(() => initialProduct?.category ?? 'Consulting');
  const [price, setPrice] = useState<number>(() => initialProduct?.price ?? 0);
  const [cost, setCost] = useState<number>(() => initialProduct?.cost ?? 0);
  const [stock, setStock] = useState<number>(() => initialProduct?.stock ?? 10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(() => initialProduct?.lowStockThreshold ?? 5);
  const [description, setDescription] = useState(() => initialProduct?.description ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || price < 0) return;

    const product: Product = {
      id: initialProduct?.id || `prod-${Date.now()}`,
      name,
      sku,
      category,
      price: Number(price),
      cost: Number(cost),
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      description,
    };

    onSave(product);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Package size={20} className="text-primary" />
            <h3 className="modal-title">{initialProduct ? 'Edit Product Item' : 'Add New Product / SKU'}</h3>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Item / Service Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Cloud Infrastructure Audit Suite"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label flex-align">
                <Tag size={14} className="text-muted" />
                <span>SKU Code</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. SVC-CLD-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label flex-align">
                <Layers size={14} className="text-muted" />
                <span>Category</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Consulting, Software, Security"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label flex-align">
                <DollarSign size={14} className="text-muted" />
                <span>Selling Price ($ USD)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label flex-align">
                <DollarSign size={14} className="text-muted" />
                <span>Unit Cost ($ USD)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={cost}
                onChange={(e) => setCost(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Initial Stock Available</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Low Stock Alert Threshold</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Item Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Architectural security audit deliverables."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialProduct ? 'Save Changes' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
