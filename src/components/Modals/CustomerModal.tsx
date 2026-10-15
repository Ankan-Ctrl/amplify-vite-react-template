import React, { useState } from 'react';
import { Customer, CustomerStatus } from '../../types';
import { X, UserPlus, Building, Mail, Phone } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void | Promise<void>;
  initialCustomer?: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCustomer,
}) => {
  const [name, setName] = useState(() => initialCustomer?.name ?? '');
  const [company, setCompany] = useState(() => initialCustomer?.company ?? '');
  const [email, setEmail] = useState(() => initialCustomer?.email ?? '');
  const [phone, setPhone] = useState(() => initialCustomer?.phone ?? '');
  const [status, setStatus] = useState<CustomerStatus>(() => initialCustomer?.status ?? 'Active');
  const [notes, setNotes] = useState(() => initialCustomer?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const customer: Customer = {
      id: initialCustomer?.id || `cust-${Date.now()}`,
      name,
      company,
      email,
      phone,
      status,
      totalSpent: initialCustomer?.totalSpent || 0,
      joinDate: initialCustomer?.joinDate || new Date().toISOString().slice(0, 10),
      notes,
    };

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(customer);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save the customer.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <UserPlus size={20} className="text-primary" />
            <h3 className="modal-title">{initialCustomer ? 'Edit Customer Profile' : 'Add New Customer'}</h3>
          </div>
          <button className="btn-close" onClick={onClose} disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {saveError && <p className="modal-save-error" role="alert">{saveError}</p>}
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Elena Rostova"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label flex-align">
                <Building size={14} className="text-muted" />
                <span>Company Name</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apex Cloud Logistics"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label flex-align">
                <Mail size={14} className="text-muted" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. contact@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label flex-align">
                <Phone size={14} className="text-muted" />
                <span>Phone Number</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. +1 (555) 234-8901"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Customer Tier / Status</label>
            <select
              className="form-input"
              value={status}
              onChange={(e) => setStatus(e.target.value as CustomerStatus)}
            >
              <option value="Active">Active Client</option>
              <option value="VIP">VIP Key Partner</option>
              <option value="Lead">Lead / Prospect</option>
              <option value="Inactive">Inactive / Past</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Account Notes</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Enterprise SLA contract terms, billing preferences."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving to AWS…' : initialCustomer ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
