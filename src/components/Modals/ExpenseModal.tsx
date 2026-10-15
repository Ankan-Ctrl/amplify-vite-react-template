import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../../types';
import { X, TrendingDown, Calendar, Tag, Building2, Repeat } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void | Promise<void>;
  initialExpense?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExpense,
}) => {
  const [description, setDescription] = useState(() => initialExpense?.description ?? '');
  const [category, setCategory] = useState<ExpenseCategory>(() => initialExpense?.category ?? 'Software');
  const [amount, setAmount] = useState<number>(() => initialExpense?.amount ?? 0);
  const [date, setDate] = useState(() => initialExpense?.date ?? new Date().toISOString().slice(0, 10));
  const [vendor, setVendor] = useState(() => initialExpense?.vendor ?? '');
  const [isRecurring, setIsRecurring] = useState(() => initialExpense?.isRecurring ?? false);
  const [notes, setNotes] = useState(() => initialExpense?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;

    const expense: Expense = {
      id: initialExpense?.id || `exp-${Date.now()}`,
      description,
      category,
      amount: Number(amount),
      date,
      vendor,
      isRecurring,
      notes,
    };

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(expense);
      onClose();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not save the expense.');
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
            <TrendingDown size={20} className="text-danger" />
            <h3 className="modal-title">{initialExpense ? 'Edit Expense Record' : 'Log New Expense'}</h3>
          </div>
          <button className="btn-close" onClick={onClose} disabled={isSaving}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {saveError && <p className="modal-save-error" role="alert">{saveError}</p>}
          <div className="form-group">
            <label className="form-label">Expense Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. AWS Production Infrastructure or Studio Rent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label flex-align">
                <Tag size={14} className="text-muted" />
                <span>Category</span>
              </label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                <option value="Software">Software & Cloud</option>
                <option value="Payroll">Payroll & Contractors</option>
                <option value="Operations">Operations & Facilities</option>
                <option value="Marketing">Marketing & Advertising</option>
                <option value="Inventory">Inventory Replenishment</option>
                <option value="Utilities">Utilities & Telecom</option>
                <option value="Other">Other / General</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount ($ USD)</label>
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
                <Building2 size={14} className="text-muted" />
                <span>Vendor / Payee</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Amazon Web Services, Google"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>

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
          </div>

          <div className="form-group checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <span className="flex-align">
                <Repeat size={14} className="text-primary" />
                <span>Fixed Monthly Recurring Expense</span>
              </span>
            </label>
          </div>

          <div className="form-group">
            <label className="form-label">Notes & Receipt Info</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Invoiced monthly on the 2nd."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving to AWS…' : initialExpense ? 'Save Changes' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
