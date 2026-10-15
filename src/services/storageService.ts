import { Sale, Expense, Customer, Product } from '../types';
import {
  INITIAL_SALES,
  INITIAL_EXPENSES,
  INITIAL_CUSTOMERS,
  INITIAL_PRODUCTS,
} from '../data/sampleData';

const STORAGE_KEYS = {
  SALES: 'bizpulse_sales_v1',
  EXPENSES: 'bizpulse_expenses_v1',
  CUSTOMERS: 'bizpulse_customers_v1',
  PRODUCTS: 'bizpulse_products_v1',
  CLOUD_MODE: 'bizpulse_cloud_mode',
};

class StorageService {
  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
      localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
  }

  public resetToSampleData(): void {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(INITIAL_SALES));
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(INITIAL_EXPENSES));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(INITIAL_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }

  // --- SALES ---
  public getSales(): Sale[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SALES);
      return data ? JSON.parse(data) : INITIAL_SALES;
    } catch {
      return INITIAL_SALES;
    }
  }

  public saveSale(sale: Sale): Sale {
    const list = this.getSales();
    const index = list.findIndex((s) => s.id === sale.id);
    let updated: Sale[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = sale;
    } else {
      updated = [sale, ...list];
    }

    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
    this.updateCustomerSpend(sale.customerName);
    return sale;
  }

  public deleteSale(id: string): void {
    const list = this.getSales();
    const target = list.find((s) => s.id === id);
    const updated = list.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
    if (target) {
      this.updateCustomerSpend(target.customerName);
    }
  }

  // --- EXPENSES ---
  public getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return data ? JSON.parse(data) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  }

  public saveExpense(expense: Expense): Expense {
    const list = this.getExpenses();
    const index = list.findIndex((e) => e.id === expense.id);
    let updated: Expense[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = expense;
    } else {
      updated = [expense, ...list];
    }

    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
    return expense;
  }

  public deleteExpense(id: string): void {
    const list = this.getExpenses();
    const updated = list.filter((e) => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(updated));
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  }

  public saveCustomer(customer: Customer): Customer {
    const list = this.getCustomers();
    const index = list.findIndex((c) => c.id === customer.id);
    let updated: Customer[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = customer;
    } else {
      updated = [customer, ...list];
    }

    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
    return customer;
  }

  public deleteCustomer(id: string): void {
    const list = this.getCustomers();
    const updated = list.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  }

  public saveProduct(product: Product): Product {
    const list = this.getProducts();
    const index = list.findIndex((p) => p.id === product.id);
    let updated: Product[];

    if (index >= 0) {
      updated = [...list];
      updated[index] = product;
    } else {
      updated = [product, ...list];
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return product;
  }

  public deleteProduct(id: string): void {
    const list = this.getProducts();
    const updated = list.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
  }

  // --- UTILITIES ---
  private updateCustomerSpend(customerIdentifier: string): void {
    const sales = this.getSales().filter(
      (s) => s.status === 'COMPLETED' && s.customerName.includes(customerIdentifier)
    );
    const total = sales.reduce((sum, s) => sum + s.amount, 0);

    const customers = this.getCustomers();
    const matched = customers.find(
      (c) => customerIdentifier.includes(c.name) || (c.company && customerIdentifier.includes(c.company))
    );

    if (matched) {
      matched.totalSpent = total;
      if (total >= 7500) {
        matched.status = 'VIP';
      } else if (total > 0 && matched.status === 'Lead') {
        matched.status = 'Active';
      }
      this.saveCustomer(matched);
    }
  }

  public exportSalesToCSV(): void {
    const sales = this.getSales();
    const headers = ['ID', 'Date', 'Customer', 'Product', 'Category', 'Quantity', 'Amount', 'Status', 'Notes'];
    const rows = sales.map((s) => [
      s.id,
      s.date,
      `"${s.customerName.replace(/"/g, '""')}"`,
      `"${s.productName.replace(/"/g, '""')}"`,
      s.category,
      s.quantity,
      s.amount,
      s.status,
      `"${(s.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bizpulse-sales-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  public exportExpensesToCSV(): void {
    const expenses = this.getExpenses();
    const headers = ['ID', 'Date', 'Description', 'Category', 'Vendor', 'Amount', 'Recurring', 'Notes'];
    const rows = expenses.map((e) => [
      e.id,
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      `"${(e.vendor || '').replace(/"/g, '""')}"`,
      e.amount,
      e.isRecurring ? 'Yes' : 'No',
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bizpulse-expenses-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const storageService = new StorageService();
