import { lazy, Suspense, useCallback, useEffect, useState, useMemo } from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import './App.css';
import {
  Sale,
  Expense,
  Customer,
  Product,
  ActiveTab,
  DateFilterRange,
} from './types';
import { businessDataService } from './services/businessDataService';
import { csvExportService } from './services/csvExportService';
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
const FilesTab = lazy(() =>
  import('./components/Storage/FilesTab').then(({ FilesTab: Component }) => ({
    default: Component,
  }))
);
import { SaleModal } from './components/Modals/SaleModal';
import { ExpenseModal } from './components/Modals/ExpenseModal';
import { CustomerModal } from './components/Modals/CustomerModal';
import { ProductModal } from './components/Modals/ProductModal';

function App() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [recordsError, setRecordsError] = useState<string | null>(null);
  const { user, signOut } = useAuthenticator((context) => [context.user]);

  const loadRecords = useCallback(async () => {
    setIsLoadingRecords(true);
    setRecordsError(null);
    try {
      const [loadedSales, loadedExpenses, loadedCustomers, loadedProducts] = await Promise.all([
        businessDataService.listSales(),
        businessDataService.listExpenses(),
        businessDataService.listCustomers(),
        businessDataService.listProducts(),
      ]);
      setSales(loadedSales);
      setExpenses(loadedExpenses);
      setCustomers(loadedCustomers);
      setProducts(loadedProducts);
    } catch (error) {
      setRecordsError(error instanceof Error ? error.message : 'Unable to load your AWS records.');
    } finally {
      setIsLoadingRecords(false);
    }
  }, []);

  useEffect(() => {
    void loadRecords();
  }, [loadRecords]);

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

  const syncCustomerSpend = async (customerIdentifier: string, currentSales: Sale[]) => {
    const currentCustomers = await businessDataService.listCustomers();
    const customer = currentCustomers.find(
      (record) =>
        customerIdentifier.includes(record.name) ||
        (record.company && customerIdentifier.includes(record.company))
    );
    if (!customer) return;

    const totalSpent = currentSales
      .filter((record) => record.status === 'COMPLETED' && record.customerName.includes(customerIdentifier))
      .reduce((total, record) => total + record.amount, 0);
    let status = customer.status;
    if (totalSpent >= 7500) status = 'VIP';
    else if (totalSpent > 0 && status === 'Lead') status = 'Active';

    const savedCustomer = await businessDataService.saveCustomer(
      { ...customer, totalSpent, status },
      true
    );
    setCustomers((current) =>
      current.map((record) => (record.id === savedCustomer.id ? savedCustomer : record))
    );
  };

  const handleSaveSale = async (sale: Sale) => {
    try {
      const exists = sales.some((record) => record.id === sale.id);
      const saved = await businessDataService.saveSale(sale, exists);
      const updatedSales = exists
        ? sales.map((record) => (record.id === saved.id ? saved : record))
        : [saved, ...sales];
      setSales(updatedSales);
      addToast('success', `Sale of $${saved.amount.toLocaleString()} saved to AWS.`);
      try {
        await syncCustomerSpend(saved.customerName, updatedSales);
      } catch (error) {
        addToast('error', `Sale saved, but customer lifetime spend was not updated: ${error instanceof Error ? error.message : 'AWS request failed.'}`);
      }
    } catch (error) {
      addToast('error', `Could not save sale to AWS: ${error instanceof Error ? error.message : 'Request failed.'}`);
      throw error;
    }
  };

  const handleDeleteSale = async (id: string) => {
    const target = sales.find((record) => record.id === id);
    try {
      await businessDataService.deleteSale(id);
      const updatedSales = sales.filter((record) => record.id !== id);
      setSales(updatedSales);
      addToast('info', 'Sale record removed from AWS.');
      if (target) {
        try {
          await syncCustomerSpend(target.customerName, updatedSales);
        } catch (error) {
          addToast('error', `Sale deleted, but customer lifetime spend was not updated: ${error instanceof Error ? error.message : 'AWS request failed.'}`);
        }
      }
    } catch (error) {
      addToast('error', `Could not delete sale from AWS: ${error instanceof Error ? error.message : 'Request failed.'}`);
    }
  };

  const handleSaveExpense = async (expense: Expense) => {
    try {
      const saved = await businessDataService.saveExpense(
        expense,
        expenses.some((record) => record.id === expense.id)
      );
      setExpenses((current) =>
        current.some((record) => record.id === saved.id)
          ? current.map((record) => (record.id === saved.id ? saved : record))
          : [saved, ...current]
      );
      addToast('success', `Expense of $${saved.amount.toLocaleString()} saved to AWS.`);
    } catch (error) {
      addToast('error', `Could not save expense to AWS: ${error instanceof Error ? error.message : 'Request failed.'}`);
      throw error;
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await businessDataService.deleteExpense(id);
      setExpenses((current) => current.filter((record) => record.id !== id));
      addToast('info', 'Expense record removed from AWS.');
    } catch (error) {
      addToast('error', `Could not delete expense from AWS: ${error instanceof Error ? error.message : 'Request failed.'}`);
    }
  };

  const handleSaveCustomer = async (customer: Customer) => {
    try {
      const saved = await businessDataService.saveCustomer(
        customer,
        customers.some((record) => record.id === customer.id)
      );
      setCustomers((current) =>
        current.some((record) => record.id === saved.id)
          ? current.map((record) => (record.id === saved.id ? saved : record))
          : [saved, ...current]
      );
      addToast('success', `Customer profile "${saved.name}" saved to AWS.`);
    } catch (error) {
      addToast('error', `Could not save customer to AWS: ${error instanceof Error ? error.message : 'Request failed.'}`);
      throw error;
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await businessDataService.deleteCustomer(id);
      setCustomers((current) => current.filter((record) => record.id !== id));
      addToast('info', 'Customer profile removed from AWS.');
    } catch (error) {
      addToast('error', `Could not delete customer from AWS: ${error instanceof Error ? error.message : 'Request failed.'}`);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    try {
      const saved = await businessDataService.saveProduct(
        product,
        products.some((record) => record.id === product.id)
      );
      setProducts((current) =>
        current.some((record) => record.id === saved.id)
          ? current.map((record) => (record.id === saved.id ? saved : record))
          : [saved, ...current]
      );
      addToast('success', `Product "${saved.name}" saved to AWS.`);
    } catch (error) {
      addToast('error', `Could not save product to AWS: ${error instanceof Error ? error.message : 'Request failed.'}`);
      throw error;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await businessDataService.deleteProduct(id);
      setProducts((current) => current.filter((record) => record.id !== id));
      addToast('info', 'Product removed from AWS.');
    } catch (error) {
      addToast('error', `Could not delete product from AWS: ${error instanceof Error ? error.message : 'Request failed.'}`);
    }
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        onNavigateTab={setActiveTab}
        userEmail={user.signInDetails?.loginId ?? user.username}
        onSignOut={() => void signOut()}
      />

      <div className="app-main-layout">
        <Sidebar
          activeTab={activeTab}
          onNavigateTab={setActiveTab}
          lowStockCount={lowStockCount}
          pendingSalesCount={pendingSalesCount}
          onExportSalesCSV={() => {
            csvExportService.exportSales(sales);
            addToast('success', 'Sales CSV exported.');
          }}
          onExportExpensesCSV={() => {
            csvExportService.exportExpenses(expenses);
            addToast('success', 'Expenses CSV exported.');
          }}
        />

        <main className="app-content-area">
          {isLoadingRecords ? (
            <p role="status">Loading your AWS business records…</p>
          ) : recordsError ? (
            <section role="alert" className="cloud-load-error">
              <h2>Could not load your AWS records</h2>
              <p>{recordsError}</p>
              <button type="button" className="btn btn-outline" onClick={() => void loadRecords()}>
                Try again
              </button>
            </section>
          ) : (
            <>
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
                csvExportService.exportSales(sales);
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
                csvExportService.exportExpenses(expenses);
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
          {activeTab === 'files' && (
            <Suspense fallback={<p role="status">Loading AWS file storage…</p>}>
              <FilesTab />
            </Suspense>
          )}
            </>
          )}
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
