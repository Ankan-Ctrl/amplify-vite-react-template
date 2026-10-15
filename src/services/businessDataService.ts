let servicePromise: Promise<typeof import('./businessDataClient').businessDataService> | undefined;

const getService = () => {
  servicePromise ??= import('./businessDataClient').then(({ businessDataService }) => businessDataService);
  return servicePromise;
};

export const businessDataService = {
  async listSales() {
    return (await getService()).listSales();
  },
  async listExpenses() {
    return (await getService()).listExpenses();
  },
  async listCustomers() {
    return (await getService()).listCustomers();
  },
  async listProducts() {
    return (await getService()).listProducts();
  },
  async saveSale(...args: Parameters<(typeof import('./businessDataClient').businessDataService)['saveSale']>) {
    return (await getService()).saveSale(...args);
  },
  async deleteSale(...args: Parameters<(typeof import('./businessDataClient').businessDataService)['deleteSale']>) {
    return (await getService()).deleteSale(...args);
  },
  async saveExpense(...args: Parameters<(typeof import('./businessDataClient').businessDataService)['saveExpense']>) {
    return (await getService()).saveExpense(...args);
  },
  async deleteExpense(...args: Parameters<(typeof import('./businessDataClient').businessDataService)['deleteExpense']>) {
    return (await getService()).deleteExpense(...args);
  },
  async saveCustomer(...args: Parameters<(typeof import('./businessDataClient').businessDataService)['saveCustomer']>) {
    return (await getService()).saveCustomer(...args);
  },
  async deleteCustomer(...args: Parameters<(typeof import('./businessDataClient').businessDataService)['deleteCustomer']>) {
    return (await getService()).deleteCustomer(...args);
  },
  async saveProduct(...args: Parameters<(typeof import('./businessDataClient').businessDataService)['saveProduct']>) {
    return (await getService()).saveProduct(...args);
  },
  async deleteProduct(...args: Parameters<(typeof import('./businessDataClient').businessDataService)['deleteProduct']>) {
    return (await getService()).deleteProduct(...args);
  },
};
