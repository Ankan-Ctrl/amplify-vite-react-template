import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';
import { Customer, CustomerStatus, Expense, ExpenseCategory, Product, Sale, SaleStatus } from '../types';

const client = generateClient<Schema>();

type ModelError = { message: string };
type ListPage<T> = {
  data: (T | null)[];
  errors?: ModelError[] | null;
  nextToken?: string | null;
};

const assertNoErrors = (errors?: ModelError[] | null): void => {
  if (errors?.length) {
    throw new Error(errors.map(({ message }) => message).join('; '));
  }
};

async function listAll<T>(
  getPage: (nextToken?: string) => Promise<ListPage<T>>
): Promise<T[]> {
  const records: T[] = [];
  let nextToken: string | undefined;

  do {
    const page = await getPage(nextToken);
    assertNoErrors(page.errors);
    records.push(...page.data.filter((record): record is T => record !== null));
    nextToken = page.nextToken ?? undefined;
  } while (nextToken);

  return records;
}

const requireResult = <T>(data: T | null | undefined, operation: string): T => {
  if (data == null) {
    throw new Error(`AWS did not return a record after ${operation}.`);
  }
  return data;
};

const requireEnumValue = <T extends string>(
  value: string | null | undefined,
  allowedValues: readonly T[],
  fieldName: string
): T => {
  if (value == null || !allowedValues.includes(value as T)) {
    throw new Error(`AWS returned an invalid value for required field "${fieldName}".`);
  }
  return value as T;
};

const SALE_STATUSES: readonly SaleStatus[] = ['COMPLETED', 'PENDING', 'REFUNDED'];
const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  'Operations',
  'Marketing',
  'Software',
  'Payroll',
  'Inventory',
  'Utilities',
  'Other',
];
const CUSTOMER_STATUSES: readonly CustomerStatus[] = ['VIP', 'Active', 'Lead', 'Inactive'];

const toSale = (record: Schema['Sale']['type']): Sale => ({
  id: record.id,
  customerName: record.customerName,
  productName: record.productName,
  amount: record.amount,
  quantity: record.quantity,
  date: record.date,
  status: requireEnumValue(record.status, SALE_STATUSES, 'Sale.status'),
  category: record.category ?? '',
  notes: record.notes ?? undefined,
});

const toExpense = (record: Schema['Expense']['type']): Expense => ({
  id: record.id,
  description: record.description,
  category: requireEnumValue(record.category, EXPENSE_CATEGORIES, 'Expense.category'),
  amount: record.amount,
  date: record.date,
  vendor: record.vendor ?? '',
  isRecurring: record.isRecurring ?? false,
  notes: record.notes ?? undefined,
});

const toCustomer = (record: Schema['Customer']['type']): Customer => ({
  id: record.id,
  name: record.name,
  email: record.email,
  phone: record.phone ?? '',
  company: record.company ?? '',
  status: requireEnumValue(record.status, CUSTOMER_STATUSES, 'Customer.status'),
  totalSpent: record.totalSpent ?? 0,
  joinDate: record.joinDate ?? '',
  notes: record.notes ?? undefined,
});

const toProduct = (record: Schema['Product']['type']): Product => ({
  id: record.id,
  name: record.name,
  sku: record.sku,
  category: record.category,
  price: record.price,
  cost: record.cost,
  stock: record.stock,
  lowStockThreshold: record.lowStockThreshold ?? 0,
  description: record.description ?? undefined,
});

export const businessDataService = {
  listSales: async (): Promise<Sale[]> =>
    (await listAll((nextToken) => client.models.Sale.list({ nextToken }))).map(toSale),

  listExpenses: async (): Promise<Expense[]> =>
    (await listAll((nextToken) => client.models.Expense.list({ nextToken }))).map(toExpense),

  listCustomers: async (): Promise<Customer[]> =>
    (await listAll((nextToken) => client.models.Customer.list({ nextToken }))).map(toCustomer),

  listProducts: async (): Promise<Product[]> =>
    (await listAll((nextToken) => client.models.Product.list({ nextToken }))).map(toProduct),

  saveSale: async (sale: Sale, exists: boolean): Promise<Sale> => {
    const input = {
      id: sale.id,
      customerName: sale.customerName,
      productName: sale.productName,
      amount: sale.amount,
      quantity: sale.quantity,
      date: sale.date,
      status: sale.status,
      category: sale.category || undefined,
      notes: sale.notes || undefined,
    };
    const result = exists
      ? await client.models.Sale.update(input)
      : await client.models.Sale.create(input);
    assertNoErrors(result.errors);
    return toSale(requireResult(result.data, 'saving the sale'));
  },

  deleteSale: async (id: string): Promise<void> => {
    const result = await client.models.Sale.delete({ id });
    assertNoErrors(result.errors);
  },

  saveExpense: async (expense: Expense, exists: boolean): Promise<Expense> => {
    const input = {
      id: expense.id,
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      vendor: expense.vendor || undefined,
      isRecurring: expense.isRecurring,
      notes: expense.notes || undefined,
    };
    const result = exists
      ? await client.models.Expense.update(input)
      : await client.models.Expense.create(input);
    assertNoErrors(result.errors);
    return toExpense(requireResult(result.data, 'saving the expense'));
  },

  deleteExpense: async (id: string): Promise<void> => {
    const result = await client.models.Expense.delete({ id });
    assertNoErrors(result.errors);
  },

  saveCustomer: async (customer: Customer, exists: boolean): Promise<Customer> => {
    const input = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || undefined,
      company: customer.company || undefined,
      status: customer.status,
      totalSpent: customer.totalSpent,
      joinDate: customer.joinDate || undefined,
      notes: customer.notes || undefined,
    };
    const result = exists
      ? await client.models.Customer.update(input)
      : await client.models.Customer.create(input);
    assertNoErrors(result.errors);
    return toCustomer(requireResult(result.data, 'saving the customer'));
  },

  deleteCustomer: async (id: string): Promise<void> => {
    const result = await client.models.Customer.delete({ id });
    assertNoErrors(result.errors);
  },

  saveProduct: async (product: Product, exists: boolean): Promise<Product> => {
    const input = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      cost: product.cost,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      description: product.description || undefined,
    };
    const result = exists
      ? await client.models.Product.update(input)
      : await client.models.Product.create(input);
    assertNoErrors(result.errors);
    return toProduct(requireResult(result.data, 'saving the product'));
  },

  deleteProduct: async (id: string): Promise<void> => {
    const result = await client.models.Product.delete({ id });
    assertNoErrors(result.errors);
  },
};
