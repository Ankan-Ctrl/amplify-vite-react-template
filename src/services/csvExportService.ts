import { Expense, Sale } from '../types';

const downloadCsv = (filename: string, rows: (string | number)[][]): void => {
  const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(
    rows.map((row) => row.join(',')).join('\n')
  )}`;
  const link = document.createElement('a');
  link.href = csvContent;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const escapeCsv = (value: string | undefined): string =>
  `"${(value ?? '').replace(/"/g, '""')}"`;

export const csvExportService = {
  exportSales(sales: Sale[]): void {
    const headers = ['ID', 'Date', 'Customer', 'Product', 'Category', 'Quantity', 'Amount', 'Status', 'Notes'];
    const rows = sales.map((sale) => [
      sale.id,
      sale.date,
      escapeCsv(sale.customerName),
      escapeCsv(sale.productName),
      escapeCsv(sale.category),
      sale.quantity,
      sale.amount,
      sale.status,
      escapeCsv(sale.notes),
    ]);

    downloadCsv(`bizpulse-sales-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  },

  exportExpenses(expenses: Expense[]): void {
    const headers = ['ID', 'Date', 'Description', 'Category', 'Vendor', 'Amount', 'Recurring', 'Notes'];
    const rows = expenses.map((expense) => [
      expense.id,
      expense.date,
      escapeCsv(expense.description),
      escapeCsv(expense.category),
      escapeCsv(expense.vendor),
      expense.amount,
      expense.isRecurring ? 'Yes' : 'No',
      escapeCsv(expense.notes),
    ]);

    downloadCsv(`bizpulse-expenses-${new Date().toISOString().slice(0, 10)}.csv`, [headers, ...rows]);
  },
};
