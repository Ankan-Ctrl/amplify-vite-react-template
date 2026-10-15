import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== BIZPULSE DATA SCHEMA ===================================================
 * Defines the core business entities for BizPulse:
 * - Sale: Tracks revenue transactions, customer links, amounts, and dates
 * - Expense: Tracks operational costs, vendors, categories, and payment flags
 * - Customer: Tracks client profiles, tiers, contact details, and lifetime spend
 * - Product: Tracks inventory items, unit costs, selling prices, and stock levels
 * =========================================================================*/

const schema = a.schema({
  Sale: a
    .model({
      customerName: a.string().required(),
      productName: a.string().required(),
      amount: a.float().required(),
      quantity: a.integer().required(),
      date: a.string().required(),
      status: a.enum(["COMPLETED", "PENDING", "REFUNDED"]),
      category: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Expense: a
    .model({
      description: a.string().required(),
      category: a.enum([
        "Operations",
        "Marketing",
        "Software",
        "Payroll",
        "Inventory",
        "Utilities",
        "Other",
      ]),
      amount: a.float().required(),
      date: a.string().required(),
      vendor: a.string(),
      isRecurring: a.boolean(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Customer: a
    .model({
      name: a.string().required(),
      email: a.string().required(),
      phone: a.string(),
      company: a.string(),
      status: a.enum(["VIP", "Active", "Lead", "Inactive"]),
      totalSpent: a.float(),
      joinDate: a.string(),
      notes: a.string(),
    })
    .authorization((allow) => [allow.owner()]),

  Product: a
    .model({
      name: a.string().required(),
      sku: a.string().required(),
      category: a.string().required(),
      price: a.float().required(),
      cost: a.float().required(),
      stock: a.integer().required(),
      lowStockThreshold: a.integer(),
      description: a.string(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
