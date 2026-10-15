import React, { useState } from 'react';
import { Sale, SaleStatus, Customer, Product } from '../../types';
import { X, DollarSign, Calendar, Tag, User, Package } from 'lucide-react';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sale: Sale) => void;
  initialSale?: Sale | null;
  customers: Customer[];
  products: Product[];
}

export const SaleModal: React.FC<SaleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSale,
  customers,
  products,
}) => {
  const [customerName, setCustomerName] = useState(() =>
    initialSale?.customerName ?? (customers[0]?.name ? `${customers[0].name} (${customers[0].company})` : '')
  );
  const [productName, setProductName] = useState(() =>
    initialSale?.productName ?? (products[0]?.name || '')
  );
  const [amount, setAmount] = useState<number>(() =>
    initialSale?.amount ?? (products[0]?.price || 500)
  );
  const [quantity, setQuantity] = useState<number>(() => initialSale?.quantity ?? 1);
  const [date, setDate] = useState(() => initialSale?.date ?? new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState<SaleStatus>(() => initialSale?.status ?? 'COMPLETED');
  const [category, setCategory] = useState(() => initialSale?.category ?? (products[0]?.category || 'Consulting'));
  const [notes, setNotes] = useState(() => initialSale?.notes ?? '');

  const handleProductSelect = (selectedName: string) => {
    setProductName(selectedName);
    const prod = products.find((p) => p.name === selectedName);
    if (prod) {
      setAmount(prod.price * quantity);
      setCategory(prod.category);
    }
  };

  const handleQuantityChange = (qty: number) => {
    setQuantity(qty);
    const prod = products.find((p) => p.name === productName);
    if (prod) {
      setAmount(prod.price * qty);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !productName || amount <= 0) return;

    const sale: Sale = {
      id: initialSale?.id || `sale-${Date.now()}`,
      customerName,
      productName,
      amount: Number(amount),
      quantity: Number(quantity),
      date,
      status,
      category,
      notes,
    };

    onSave(sale);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <DollarSign size={20} className="text-primary" />
            <h3 className="modal-title">{initialSale ? 'Edit Sale Transaction' : 'Record New Sale'}</h3>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label flex-align">
              <User size={14} className="text-muted" />
              <span>Customer / Account</span>
            </label>
            <input
              type="text"
              list="customer-suggestions"
              className="form-input"
              placeholder="e.g. Elena Rostova (Apex Cloud Logistics)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
            <datalist id="customer-suggestions">
              {customers.map((c) => (
                <option key={c.id} value={`${c.name} (${c.company})`} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label className="form-label flex-align">
              <Package size={14} className="text-muted" />
              <span>Product or Service</span>
            </label>
            <select
              className="form-input"
              value={productName}
              onChange={(e) => handleProductSelect(e.target.value)}
              required
            >
              <option value="">Select an offering or custom...</option>
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} — ${p.price}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number(e.target.value))}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label flex-align">
                <DollarSign size={14} className="text-muted" />
                <span>Total Amount ($ USD)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label flex-align">
                <Calendar size={14} className="text-muted" />
                <span>Date</span>
              </label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value as SaleStatus)}
              >
                <option value="COMPLETED">Completed (Paid)</option>
                <option value="PENDING">Pending (Invoice Sent)</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label flex-align">
              <Tag size={14} className="text-muted" />
              <span>Revenue Category</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Consulting, Software, Security, Data"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Delivery Details</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Deliverables approved by client lead."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialSale ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
