# BizPulse — AWS Business Analytics & Operations Dashboard

**BizPulse** is an executive-grade business analytics and operational management web application built with **React 18**, **TypeScript**, **Vite**, and **AWS Amplify Gen 2**. 

It is designed for small-business owners and operators to understand overall business performance, track day-to-day transaction ledgers, monitor inventory replenishment levels, and make data-driven decisions from a unified dashboard.

---

## 🚀 Key Highlights & Capabilities

- **Executive Analytics Overview**:
  - Live KPI cards: Gross Revenue, Operating Expenses, Net Profit Margin %, and Pending Receivables.
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
- **Dual Runtime Support**:
  - **Offline Local PC Demonstration Mode**: Immediate local execution with sample business data saved to browser `localStorage`. Includes a 1-click **Reset Sample Data** button for demonstrations.
  - **AWS Amplify Gen 2 Cloud Integration**: Production-ready data models and backend definition files ready to deploy to AWS AppSync (GraphQL), Amazon DynamoDB, and Amazon Cognito.
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
3. **AppSync Real-Time GraphQL**: Dashboard receives instant updates via WebSockets with `client.models.<Entity>.observeQuery()`.
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
```bash
npm run dev
```
Open your browser at `http://localhost:5173` to explore BizPulse with pre-loaded realistic sample data.

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

To connect BizPulse to a live AWS backend:

1. **Configure AWS Credentials**:
   ```bash
   aws configure
   ```

2. **Launch Personal AWS Cloud Sandbox**:
   ```bash
   npx ampx sandbox
   ```
   This will synthesize the AWS CDK constructs, deploy AppSync, DynamoDB tables, and Cognito pools to your AWS account, and automatically generate `amplify_outputs.json`.

3. **Deploy Fullstack App to Amplify Hosting**:
   Connect your Git repository to the [AWS Amplify Console](https://console.aws.amazon.com/amplify) for automatic continuous deployment (CI/CD) on every push.

---

## 📂 Project Structure

```
amplify-vite-react-template/
├── amplify/                       # AWS Amplify Gen 2 Backend Definitions
│   ├── auth/                      # Amazon Cognito User Pool authentication configuration
│   │   └── resource.ts
│   ├── data/                      # AppSync GraphQL schema & DynamoDB models (Sale, Expense, Customer, Product)
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
│   │   └── Sales/                 # Revenue transactions ledger & status filters
│   ├── data/                      # Realistic initial business sample dataset
│   ├── services/                  # Analytics computation engine & LocalStorage persistence layer
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