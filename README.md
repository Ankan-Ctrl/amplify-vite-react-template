# BizPulse — AWS Business Analytics & Operations Dashboard

**BizPulse** is an executive-grade business analytics and operational management web application built with **React 18**, **TypeScript**, **Vite**, and **AWS Amplify Gen 2**. 

It is designed for small-business owners and operators to understand overall business performance, track day-to-day transaction ledgers, monitor inventory replenishment levels, and make data-driven decisions from a unified dashboard.

---

## 🚀 Key Highlights & Capabilities

- **Executive Analytics Overview**:
  - KPI cards: Gross Revenue, Operating Expenses, Net Profit Margin %, and Pending Receivables.
  - Interactive SVG time-series charts for Monthly Revenue vs. Expense trends.
  - Category breakdown donut charts for operating costs.
  - Date filtering: Last 7 Days, Last 30 Days, Last 90 Days, Year-to-Date (YTD), and All Time.
- **Smart Decision Intelligence Engine**:
  - Rule-based alerts identifying low-stock inventory risks, uncollected customer receivables, high customer concentration risks, and cloud cost efficiencies.
  - One-click navigation from insights to the respective ledger.
- **Complete Operational Ledgers**:
  - **Sales & Invoices**: Add, edit, delete transactions with customer association, product lookups, payment status tracking (`COMPLETED`, `PENDING`, `REFUNDED`), and CSV export.
  - **Expense Ledger**: Categorize overhead across Software & Cloud, Payroll, Operations, Marketing, and Inventory, with monthly recurring expense tracking and CSV export.
  - **Customer Directory (CRM)**: Manage enterprise client accounts, tier segmentation (`VIP`, `Active`, `Lead`, `Inactive`), contact info, and lifetime revenue accumulation.
  - **Product & Inventory Catalog**: Track SKUs, selling prices, unit costs, profit margins %, stock counters, and visual replenishment threshold alerts.
- **AWS Amplify Gen 2 Cloud Integration**:
  - Cognito email sign-in, owner-authorized AppSync CRUD operations, and DynamoDB persistence for sales, expenses, customers, and products.
  - Private file storage: signed-in users can upload, list, download, and delete files in their own Amazon S3 storage path.
  - Business records are not stored in browser `localStorage`; the dashboard requires a deployed Amplify backend.
- **AWS Cloud Blueprint & Technical Walkthrough Tab**:
  - Interactive architecture diagram explaining presentation, edge distribution, API orchestration, and persistence layers.
  - Technical talking points for academic, professional, or client presentations.
  - Direct schema and backend code inspector.

---

## ☁️ AWS Cloud Computing Architecture

BizPulse is architected around modern AWS Serverless patterns:

```
[ Browser / Client ] 
        │  (HTTPS / CloudFront Edge CDN)
        ▼
[ AWS Amplify Hosting + Amazon S3 ]
        │  (GraphQL API Query / Mutation)
        ▼
[ AWS AppSync (Managed GraphQL Engine) ] ◄──► [ Amazon Cognito (JWT Auth & User Pool) ]
        │  (Direct IAM Data Resolvers)
        ▼
[ Amazon DynamoDB (NoSQL Data Store) ]
  ├── Sale Table
  ├── Expense Table
  ├── Customer Table
  └── Product Table
```

### Why AWS Amplify Gen 2?
1. **Code-First TypeScript Infrastructure**: No complex CloudFormation JSON/YAML templates. Backend schema is defined in `amplify/data/resource.ts` and type-checked via `tsc`.
2. **End-to-End Type Safety**: Frontend data client inherits TypeScript interfaces directly from backend models.
3. **AppSync GraphQL CRUD**: The dashboard creates, reads, updates, and deletes owner-authorized records through the generated Amplify Data client.
4. **Isolated Sandboxes**: Fast developer cloud environments spun up with `npx ampx sandbox`.

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
- Node.js `>= 20.20.0`
- npm `>= 10.8.0`

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install --legacy-peer-deps
```

### 2. Run Local Development Server
Generate backend outputs first using an AWS account and credentials:
```bash
npx ampx sandbox
```
Keep the sandbox process running while developing; it generates `amplify_outputs.json`.

```bash
npm run dev
```
Open your browser at `http://localhost:5173` and sign in with a Cognito account to access its cloud records. This app no longer uses the old browser demo data, and existing `localStorage` records are not migrated to AWS.

### 3. Build & Type Check
```bash
npm run build
```

### 4. Code Linting
```bash
npm run lint
```

---

## 🌐 Deploying to AWS Cloud

To deploy BizPulse to an AWS backend:

1. **Configure AWS Credentials**:
   ```bash
   aws configure
   ```

2. **Launch Personal AWS Cloud Sandbox**:
   ```bash
   npx ampx sandbox
   ```
   This will synthesize the AWS CDK constructs, deploy AppSync, DynamoDB tables, and Cognito pools to your AWS account, and automatically generate `amplify_outputs.json`.

3. **Deploy with Amplify Hosting**:
   Connect your Git repository to the [AWS Amplify Console](https://console.aws.amazon.com/amplify) for automatic continuous deployment (CI/CD) on every push. Amplify deploys the backend, generates `amplify_outputs.json`, and then builds the React frontend.

### Private file storage

Users sign in through Cognito. Sales, expenses, customers, and products are accessed through the generated Amplify Data client and stored in DynamoDB; model authorization restricts records to their owner. The **File Storage** area uses Amplify Storage backed by Amazon S3, with access restricted to each user's own path. AppSync/Data/S3 calls require a successful backend deployment; the app displays a setup message rather than falling back to browser storage if its Amplify configuration is missing.

Each Cognito user sees only records created under their own account. Existing local demo records are not copied into DynamoDB automatically.

---

## 📂 Project Structure

```
amplify-vite-react-template/
├── amplify/                       # AWS Amplify Gen 2 Backend Definitions
│   ├── auth/                      # Amazon Cognito User Pool authentication configuration
│   │   └── resource.ts
│   ├── data/                      # AppSync GraphQL schema & DynamoDB models (Sale, Expense, Customer, Product)
│   │   └── resource.ts
│   ├── storage/                   # Private, per-user Amazon S3 file storage
│   │   └── resource.ts
│   └── backend.ts                 # Main CDK backend definition
├── src/
│   ├── components/
│   │   ├── Architecture/          # AWS Cloud Architecture presentation tab & code inspector
│   │   ├── Charts/                # Interactive SVG time series & category donut charts
│   │   ├── Common/                # Header, Sidebar navigation, Toast container
│   │   ├── Customers/             # Customer CRM directory & account tiers
│   │   ├── Dashboard/             # Executive Overview, MetricCards, Decision Assistant
│   │   ├── Expenses/              # Operating expense ledger & categories
│   │   ├── Inventory/             # Product catalog & stock replenishment alerts
│   │   ├── Modals/                # Modals for creating/editing Sales, Expenses, Customers, Products
│   │   ├── Sales/                 # Revenue transactions ledger & status filters
│   │   └── Storage/               # Authenticated Amazon S3 file manager
│   ├── data/                      # Legacy illustrative sample dataset (not loaded by the app)
│   ├── services/                  # Analytics, Amplify Data, and CSV export services
│   ├── types/                     # Central TypeScript interfaces
│   ├── App.css                    # Modern dark SaaS design system
│   ├── App.tsx                    # Root application component
│   └── main.tsx                   # Entry point with graceful Amplify configuration
├── package.json
└── README.md
```

---

## 📄 License
This project is open-source under the MIT-0 License.