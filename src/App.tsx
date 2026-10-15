import { useState, useMemo } from 'react';
import './App.css';
import {
  Sale,
  Expense,
  Customer,
  Product,
  ActiveTab,
  DateFilterRange,
} from './types';
import { storageService } from './services/storageService';
import { AnalyticsService } from './services/analyticsService';
import { Header } from './components/Common/Header';
import { Sidebar } from './components/Common/Sidebar';
import { ToastContainer, ToastMessage } from './components/Common/Toast';
import { OverviewTab } from './components/Dashboard/OverviewTab';
import { SalesTab } from './components/Sales/SalesTab';
import { ExpensesTab } from './components/Expenses/ExpensesTab';
import { CustomersTab } from './components/Customers/CustomersTab';
import { InventoryTab } from './components/Inventory/InventoryTab';
import { ArchitectureTab } from './components/Architecture/ArchitectureTab';
import { SaleModal } from './components/Modals/SaleModal';
import { ExpenseModal } from './components/Modals/ExpenseModal';
import { CustomerModal } from './components/Modals/CustomerModal';
import { ProductModal } from './components/Modals/ProductModal';

function App() {
  // Master state synchronized with local storage
  const [sales, setSales] = useState<Sale[]>(() => storageService.getSales());
  const [expenses, setExpenses] = useState<Expense[]>(() => storageService.getExpenses());
  const [customers, setCustomers] = useState<Customer[]>(() => storageService.getCustomers());
  const [products, setProducts] = useState<Product[]>(() => storageService.getProducts());

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [dateRange, setDateRange] = useState<DateFilterRange>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Toast feedback helper
  const addToast = (type: ToastMessage['type'], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Recalculated analytics
  const summary = useMemo(() => {
    return AnalyticsService.calculateSummary(sales, expenses, customers, products, dateRange);
  }, [sales, expenses, customers, products, dateRange]);

  const monthlyData = useMemo(() => {
    return AnalyticsService.getMonthlyData(sales, expenses);
  }, [sales, expenses]);

  const expenseCategories = useMemo(() => {
    return AnalyticsService.getExpenseCategoryBreakdown(expenses, dateRange);
  }, [expenses, dateRange]);

  const decisionInsights = useMemo(() => {
    return AnalyticsService.generateDecisionInsights(sales, expenses, customers, products);
  }, [sales, expenses, customers, products]);

  const lowStockCount = useMemo(() => {
    return products.filter((p) => p.stock <= p.lowStockThreshold).length;
  }, [products]);

  const pendingSalesCount = useMemo(() => {
    return sales.filter((s) => s.status === 'PENDING').length;
  }, [sales]);

  // --- CRUD HANDLERS ---
  const handleSaveSale = (sale: Sale) => {
    const saved = storageService.saveSale(sale);
    setSales(storageService.getSales());
    setCustomers(storageService.getCustomers());
    addToast('success', `Sale of $${saved.amount.toLocaleString()} saved.`);
  };

  const handleDeleteSale = (id: string) => {
    storageService.deleteSale(id);
    setSales(storageService.getSales());
    setCustomers(storageService.getCustomers());
    addToast('info', 'Sale record removed.');
  };

  const handleSaveExpense = (expense: Expense) => {
    const saved = storageService.saveExpense(expense);
    setExpenses(storageService.getExpenses());
    addToast('success', `Expense of $${saved.amount.toLocaleString()} logged.`);
  };

  const handleDeleteExpense = (id: string) => {
    storageService.deleteExpense(id);
    setExpenses(storageService.getExpenses());
    addToast('info', 'Expense record removed.');
  };

  const handleSaveCustomer = (customer: Customer) => {
    storageService.saveCustomer(customer);
    setCustomers(storageService.getCustomers());
    addToast('success', `Customer profile "${customer.name}" updated.`);
  };

  const handleDeleteCustomer = (id: string) => {
    storageService.deleteCustomer(id);
    setCustomers(storageService.getCustomers());
    addToast('info', 'Customer profile removed.');
  };

  const handleSaveProduct = (product: Product) => {
    storageService.saveProduct(product);
    setProducts(storageService.getProducts());
    addToast('success', `Product "${product.name}" saved in catalog.`);
  };

  const handleDeleteProduct = (id: string) => {
    storageService.deleteProduct(id);
    setProducts(storageService.getProducts());
    addToast('info', 'Product removed from catalog.');
  };

  const handleResetDemoData = () => {
    if (
      window.confirm(
        'Reset all BizPulse records back to original sample dataset? Any unsaved custom entries will be restored to defaults.'
      )
    ) {
      storageService.resetToSampleData();
      setSales(storageService.getSales());
      setExpenses(storageService.getExpenses());
      setCustomers(storageService.getCustomers());
      setProducts(storageService.getProducts());
      addToast('info', 'Sample dataset reloaded successfully.');
    }
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        onResetDemoData={handleResetDemoData}
      />

      <div className="app-main-layout">
        <Sidebar
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
          lowStockCount={lowStockCount}
          pendingSalesCount={pendingSalesCount}
          onExportSalesCSV={() => {
            storageService.exportSalesToCSV();
            addToast('success', 'Sales CSV exported.');
          }}
          onExportExpensesCSV={() => {
            storageService.exportExpensesToCSV();
            addToast('success', 'Expenses CSV exported.');
          }}
        />

        <main className="app-content-area">
          {activeTab === 'overview' && (
            <OverviewTab
              sales={sales}
              expenses={expenses}
              customers={customers}
              products={products}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              summary={summary}
              monthlyData={monthlyData}
              expenseCategories={expenseCategories}
              insights={decisionInsights}
              onNavigateTab={setActiveTab}
              onOpenSaleModal={() => {
                setEditingSale(null);
                setIsSaleModalOpen(true);
              }}
              onOpenExpenseModal={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
            />
          )}

          {activeTab === 'sales' && (
            <SalesTab
              sales={sales}
              onOpenSaleModal={(sale) => {
                setEditingSale(sale || null);
                setIsSaleModalOpen(true);
              }}
              onDeleteSale={handleDeleteSale}
              onExportCSV={() => {
                storageService.exportSalesToCSV();
                addToast('success', 'Sales ledger exported as CSV.');
              }}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesTab
              expenses={expenses}
              onOpenExpenseModal={(exp) => {
                setEditingExpense(exp || null);
                setIsExpenseModalOpen(true);
              }}
              onDeleteExpense={handleDeleteExpense}
              onExportCSV={() => {
                storageService.exportExpensesToCSV();
                addToast('success', 'Expense ledger exported as CSV.');
              }}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersTab
              customers={customers}
              onOpenCustomerModal={(cust) => {
                setEditingCustomer(cust || null);
                setIsCustomerModalOpen(true);
              }}
              onDeleteCustomer={handleDeleteCustomer}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              products={products}
              onOpenProductModal={(prod) => {
                setEditingProduct(prod || null);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
            />
          )}

          {activeTab === 'architecture' && <ArchitectureTab />}
        </main>
      </div>

      {/* Modals */}
      {isSaleModalOpen && (
        <SaleModal
          key={editingSale?.id || 'new-sale'}
          isOpen={isSaleModalOpen}
          onClose={() => {
            setIsSaleModalOpen(false);
            setEditingSale(null);
          }}
          onSave={handleSaveSale}
          initialSale={editingSale}
          customers={customers}
          products={products}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseModal
          key={editingExpense?.id || 'new-expense'}
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onSave={handleSaveExpense}
          initialExpense={editingExpense}
        />
      )}

      {isCustomerModalOpen && (
        <CustomerModal
          key={editingCustomer?.id || 'new-customer'}
          isOpen={isCustomerModalOpen}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
          initialCustomer={editingCustomer}
        />
      )}

      {isProductModalOpen && (
        <ProductModal
          key={editingProduct?.id || 'new-product'}
          isOpen={isProductModalOpen}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
          initialProduct={editingProduct}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default App;
