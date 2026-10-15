import {
  Sale,
  Expense,
  Customer,
  Product,
  DateFilterRange,
  BusinessSummary,
  MonthlyDataPoint,
  CategoryBreakdown,
  DecisionInsight,
} from '../types';

export class AnalyticsService {
  public static filterByDate<T extends { date: string }>(
    items: T[],
    range: DateFilterRange,
    referenceDate = new Date('2026-10-14') // matches context current date
  ): T[] {
    if (range === 'all') return items;

    const ref = new Date(referenceDate);
    let cutoff: Date;

    switch (range) {
      case '7d':
        cutoff = new Date(ref);
        cutoff.setDate(ref.getDate() - 7);
        break;
      case '30d':
        cutoff = new Date(ref);
        cutoff.setDate(ref.getDate() - 30);
        break;
      case '90d':
        cutoff = new Date(ref);
        cutoff.setDate(ref.getDate() - 90);
        break;
      case 'ytd':
        cutoff = new Date(ref.getFullYear(), 0, 1);
        break;
      default:
        return items;
    }

    return items.filter((item) => new Date(item.date) >= cutoff);
  }

  public static calculateSummary(
    sales: Sale[],
    expenses: Expense[],
    customers: Customer[],
    products: Product[],
    range: DateFilterRange
  ): BusinessSummary {
    const filteredSales = this.filterByDate(sales, range);
    const filteredExpenses = this.filterByDate(expenses, range);

    const completedSales = filteredSales.filter((s) => s.status === 'COMPLETED');
    const pendingSales = filteredSales.filter((s) => s.status === 'PENDING');

    const totalRevenue = completedSales.reduce((acc, s) => acc + s.amount, 0);
    const pendingSalesAmount = pendingSales.reduce((acc, s) => acc + s.amount, 0);
    const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMarginPercent = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const averageOrderValue = completedSales.length > 0 ? totalRevenue / completedSales.length : 0;

    const activeCustomers = customers.filter((c) => c.status === 'Active' || c.status === 'VIP').length;
    const lowStockItems = products.filter((p) => p.stock <= p.lowStockThreshold).length;

    // Month-over-Month calculation (comparing October 2026 vs September 2026)
    const octSales = sales.filter((s) => s.date.startsWith('2026-10') && s.status === 'COMPLETED');
    const sepSales = sales.filter((s) => s.date.startsWith('2026-09') && s.status === 'COMPLETED');
    const octRev = octSales.reduce((acc, s) => acc + s.amount, 0);
    const sepRev = sepSales.reduce((acc, s) => acc + s.amount, 0);
    const revenueGrowthMoM = sepRev > 0 ? ((octRev - sepRev) / sepRev) * 100 : 0;

    const octExp = expenses.filter((e) => e.date.startsWith('2026-10')).reduce((acc, e) => acc + e.amount, 0);
    const sepExp = expenses.filter((e) => e.date.startsWith('2026-09')).reduce((acc, e) => acc + e.amount, 0);
    const expenseGrowthMoM = sepExp > 0 ? ((octExp - sepExp) / sepExp) * 100 : 0;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMarginPercent,
      totalSalesCount: filteredSales.length,
      completedSalesCount: completedSales.length,
      pendingSalesAmount,
      averageOrderValue,
      activeCustomerCount: activeCustomers,
      lowStockItemsCount: lowStockItems,
      revenueGrowthMoM: Math.round(revenueGrowthMoM * 10) / 10,
      expenseGrowthMoM: Math.round(expenseGrowthMoM * 10) / 10,
    };
  }

  public static getMonthlyData(sales: Sale[], expenses: Expense[]): MonthlyDataPoint[] {
    const months = [
      { key: '2026-06', label: 'Jun' },
      { key: '2026-07', label: 'Jul' },
      { key: '2026-08', label: 'Aug' },
      { key: '2026-09', label: 'Sep' },
      { key: '2026-10', label: 'Oct' },
    ];

    return months.map((m) => {
      const monthSales = sales
        .filter((s) => s.date.startsWith(m.key) && s.status === 'COMPLETED')
        .reduce((sum, s) => sum + s.amount, 0);

      const monthExpenses = expenses
        .filter((e) => e.date.startsWith(m.key))
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        month: m.label,
        revenue: monthSales,
        expenses: monthExpenses,
        profit: monthSales - monthExpenses,
      };
    });
  }

  public static getExpenseCategoryBreakdown(
    expenses: Expense[],
    range: DateFilterRange
  ): CategoryBreakdown[] {
    const filtered = this.filterByDate(expenses, range);
    const total = filtered.reduce((acc, e) => acc + e.amount, 0);
    const groups: { [cat: string]: { amount: number; count: number } } = {};

    filtered.forEach((e) => {
      if (!groups[e.category]) {
        groups[e.category] = { amount: 0, count: 0 };
      }
      groups[e.category].amount += e.amount;
      groups[e.category].count += 1;
    });

    return Object.entries(groups)
      .map(([category, val]) => ({
        category,
        amount: val.amount,
        percentage: total > 0 ? Math.round((val.amount / total) * 100) : 0,
        count: val.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  public static getSalesCategoryBreakdown(
    sales: Sale[],
    range: DateFilterRange
  ): CategoryBreakdown[] {
    const filtered = this.filterByDate(sales, range).filter((s) => s.status === 'COMPLETED');
    const total = filtered.reduce((acc, s) => acc + s.amount, 0);
    const groups: { [cat: string]: { amount: number; count: number } } = {};

    filtered.forEach((s) => {
      const cat = s.category || 'General';
      if (!groups[cat]) {
        groups[cat] = { amount: 0, count: 0 };
      }
      groups[cat].amount += s.amount;
      groups[cat].count += 1;
    });

    return Object.entries(groups)
      .map(([category, val]) => ({
        category,
        amount: val.amount,
        percentage: total > 0 ? Math.round((val.amount / total) * 100) : 0,
        count: val.count,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  public static generateDecisionInsights(
    sales: Sale[],
    expenses: Expense[],
    customers: Customer[],
    products: Product[]
  ): DecisionInsight[] {
    const insights: DecisionInsight[] = [];

    // 1. Low stock inventory alert
    const lowStock = products.filter((p) => p.stock <= p.lowStockThreshold);
    if (lowStock.length > 0) {
      insights.push({
        id: 'ins-stock',
        type: 'alert',
        title: `Low Inventory Alert: ${lowStock.length} Product${lowStock.length > 1 ? 's' : ''} Need Restock`,
        description: `Items such as "${lowStock[0].name}" (stock: ${lowStock[0].stock}, threshold: ${lowStock[0].lowStockThreshold}) are running low.`,
        impact: 'Risk of missed consulting deliveries or backorders.',
        actionLabel: 'Review Inventory',
        actionTab: 'inventory',
      });
    }

    // 2. Pending receivables
    const pendingSales = sales.filter((s) => s.status === 'PENDING');
    const pendingAmount = pendingSales.reduce((acc, s) => acc + s.amount, 0);
    if (pendingAmount > 0) {
      insights.push({
        id: 'ins-pending',
        type: 'opportunity',
        title: `Uncollected Receivables: $${pendingAmount.toLocaleString()} Pending`,
        description: `${pendingSales.length} open customer invoices are pending payment confirmation.`,
        impact: 'Accelerate collection to increase cash buffer.',
        actionLabel: 'View Pending Sales',
        actionTab: 'sales',
      });
    }

    // 3. Top customer concentration
    const totalRev = sales.filter((s) => s.status === 'COMPLETED').reduce((acc, s) => acc + s.amount, 0);
    const topCustomer = customers.reduce((prev, curr) => (curr.totalSpent > prev.totalSpent ? curr : prev), customers[0]);

    if (topCustomer && totalRev > 0) {
      const topShare = Math.round((topCustomer.totalSpent / totalRev) * 100);
      insights.push({
        id: 'ins-vip',
        type: 'positive',
        title: `VIP Relationship: ${topCustomer.company || topCustomer.name}`,
        description: `${topCustomer.name} accounts for ${topShare}% of all recorded revenue ($${topCustomer.totalSpent.toLocaleString()}).`,
        impact: 'Key enterprise relationship. Schedule quarterly executive check-in.',
        actionLabel: 'Inspect Customer Profile',
        actionTab: 'customers',
      });
    }

    // 4. Cloud infrastructure spend optimization
    const awsExpenses = expenses.filter((e) => e.vendor.toLowerCase().includes('amazon') || e.vendor.toLowerCase().includes('aws'));
    const totalAws = awsExpenses.reduce((sum, e) => sum + e.amount, 0);
    if (totalAws > 0) {
      insights.push({
        id: 'ins-cloud',
        type: 'neutral',
        title: `AWS Architecture Optimization`,
        description: `Running serverless on AppSync & DynamoDB keeps fixed monthly cloud overhead low (~$680/mo vs $2.5k+ on standard EC2 clusters).`,
        impact: 'High operational leverage & 74% gross margin on cloud consulting.',
        actionLabel: 'Examine Cloud Architecture',
        actionTab: 'architecture',
      });
    }

    return insights;
  }
}
