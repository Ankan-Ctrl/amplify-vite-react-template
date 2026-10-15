export type SaleStatus = 'COMPLETED' | 'PENDING' | 'REFUNDED';

export interface Sale {
  id: string;
  customerName: string;
  productName: string;
  amount: number;
  quantity: number;
  date: string; // ISO YYYY-MM-DD
  status: SaleStatus;
  category: string;
  notes?: string;
  createdAt?: string;
}

export type ExpenseCategory = 
  | 'Operations' 
  | 'Marketing' 
  | 'Software' 
  | 'Payroll' 
  | 'Inventory' 
  | 'Utilities'
  | 'Other';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  vendor: string;
  isRecurring: boolean;
  notes?: string;
  createdAt?: string;
}

export type CustomerStatus = 'VIP' | 'Active' | 'Lead' | 'Inactive';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: CustomerStatus;
  totalSpent: number;
  joinDate: string;
  notes?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  lowStockThreshold: number;
  description?: string;
}

export type DateFilterRange = '7d' | '30d' | '90d' | 'ytd' | 'all';

export type ActiveTab =
  | 'overview'
  | 'sales'
  | 'expenses'
  | 'customers'
  | 'inventory'
  | 'files'
  | 'architecture';

export interface BusinessSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercent: number;
  totalSalesCount: number;
  completedSalesCount: number;
  pendingSalesAmount: number;
  averageOrderValue: number;
  activeCustomerCount: number;
  lowStockItemsCount: number;
  revenueGrowthMoM: number;
  expenseGrowthMoM: number;
}

export interface MonthlyDataPoint {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface DecisionInsight {
  id: string;
  type: 'alert' | 'opportunity' | 'positive' | 'neutral';
  title: string;
  description: string;
  impact: string;
  actionLabel?: string;
  actionTab?: ActiveTab;
}
