import React, { useState } from 'react';
import {
  Cloud,
  Database,
  Lock,
  Server,
  Zap,
  Terminal,
  FileCode,
  ShieldCheck,
  CheckCircle,
  Copy,
  Layers,
} from 'lucide-react';

export const ArchitectureTab: React.FC = () => {
  const [activeCodeTab, setActiveCodeTab] = useState<'schema' | 'auth' | 'backend'>('schema');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const schemaSnippet = `// amplify/data/resource.ts
import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Sale: a.model({
    customerName: a.string().required(),
    productName: a.string().required(),
    amount: a.float().required(),
    quantity: a.integer().required(),
    date: a.string().required(),
    status: a.enum(["COMPLETED", "PENDING", "REFUNDED"]),
    category: a.string(),
  }).authorization(allow => [allow.owner()]),

  Expense: a.model({
    description: a.string().required(),
    category: a.enum(["Operations", "Marketing", "Software", "Payroll", "Inventory", "Utilities", "Other"]),
    amount: a.float().required(),
    date: a.string().required(),
    vendor: a.string(),
    isRecurring: a.boolean(),
    notes: a.string(),
  }).authorization(allow => [allow.owner()]),

  Customer: a.model({
    name: a.string().required(),
    email: a.string().required(),
    company: a.string(),
    status: a.enum(["VIP", "Active", "Lead", "Inactive"]),
    totalSpent: a.float(),
    notes: a.string(),
  }).authorization(allow => [allow.owner()]),

  Product: a.model({
    name: a.string().required(),
    sku: a.string().required(),
    category: a.string().required(),
    price: a.float().required(),
    cost: a.float().required(),
    stock: a.integer().required(),
    lowStockThreshold: a.integer(),
    description: a.string(),
  }).authorization(allow => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;
export const data = defineData({
  schema,
  authorizationModes: { defaultAuthorizationMode: "userPool" },
});`;

  const authSnippet = `// amplify/auth/resource.ts
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true, // Amazon Cognito User Pool with Passwordless / OTP or Password Auth
  },
});`;

  const backendSnippet = `// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

// AWS CDK constructs provisioned automatically under the hood:
// - AWS AppSync Managed GraphQL API
// - Amazon DynamoDB Tables
// - Amazon Cognito User Pool & Identity Pool
// - AWS IAM Policies & Roles
defineBackend({
  auth,
  data,
});`;

  return (
    <div className="tab-content architecture-tab">
      {/* Header */}
      <div className="section-header-row">
        <div>
          <div className="badge badge-info flex-align" style={{ width: 'fit-content', marginBottom: '8px' }}>
            <Cloud size={14} />
            <span>AWS Cloud Computing Project Specification</span>
          </div>
          <h2 className="page-heading">AWS Cloud Architecture & Technical Blueprint</h2>
          <p className="page-subheading">
            Enterprise serverless architecture powering BizPulse with AWS Amplify Gen 2, AppSync GraphQL, DynamoDB, and Cognito.
          </p>
        </div>
      </div>

      {/* Cloud Status Banner */}
      <div className="card cloud-status-banner">
        <div className="status-banner-left">
          <div className="status-indicator-bubble active-local">
            <span className="pulse-ping" />
            <span className="status-dot" />
          </div>
          <div>
            <h4 className="banner-title">Current Runtime: Local High-Performance PC Mode</h4>
            <p className="banner-sub">
              Running with in-memory & browser storage engine. Zero cloud infrastructure cost, instant local evaluation, and full offline persistence.
            </p>
          </div>
        </div>
        <div className="status-banner-right">
          <span className="tag-ready">AWS Gen 2 Ready</span>
        </div>
      </div>

      {/* Visual Architecture Diagram Grid */}
      <div className="card architecture-diagram-card">
        <h3 className="section-title">System Architecture & Data Flow</h3>
        <p className="section-subtitle">
          End-to-end cloud pipeline: from browser client through edge distribution to serverless database.
        </p>

        <div className="architecture-grid">
          {/* Layer 1: Client */}
          <div className="arch-node-card">
            <div className="node-icon-wrap icon-client">
              <Layers size={22} />
            </div>
            <span className="node-layer">Presentation Layer</span>
            <h4 className="node-title">React 18 + Vite SPA</h4>
            <p className="node-desc">
              TypeScript dashboard with client-side analytics and forms that read and write owner-protected business records through Amplify Data.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">React 18</span>
              <span className="tech-tag">TypeScript</span>
              <span className="tech-tag">Vite 7</span>
            </div>
          </div>

          <div className="arch-arrow">
            <span>HTTPS</span>
            &rarr;
          </div>

          {/* Layer 2: Edge & CDN */}
          <div className="arch-node-card">
            <div className="node-icon-wrap icon-cdn">
              <Cloud size={22} />
            </div>
            <span className="node-layer">Edge Distribution</span>
            <h4 className="node-title">Amplify Hosting & CDN</h4>
            <p className="node-desc">
              Amazon CloudFront global edge caching and S3 static asset delivery with automated CI/CD branch deployments.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">CloudFront</span>
              <span className="tech-tag">Amazon S3</span>
              <span className="tech-tag">Edge SSL</span>
            </div>
          </div>

          <div className="arch-arrow">
            <span>GraphQL</span>
            &rarr;
          </div>

          {/* Layer 3: API Gateway / AppSync */}
          <div className="arch-node-card">
            <div className="node-icon-wrap icon-api">
              <Server size={22} />
            </div>
            <span className="node-layer">Managed API Layer</span>
            <h4 className="node-title">AWS AppSync</h4>
            <p className="node-desc">
              Serverless GraphQL API validates CRUD requests and enforces Cognito owner authorization for each business record.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">AppSync</span>
              <span className="tech-tag">GraphQL</span>
              <span className="tech-tag">CRUD API</span>
            </div>
          </div>

          <div className="arch-arrow">
            <span>Direct IAM</span>
            &rarr;
          </div>

          {/* Layer 4: Storage */}
          <div className="arch-node-card">
            <div className="node-icon-wrap icon-db">
              <Database size={22} />
            </div>
            <span className="node-layer">Persistence Engine</span>
            <h4 className="node-title">Amazon DynamoDB</h4>
            <p className="node-desc">
              Amplify Data stores sales, expenses, customers, and products in managed DynamoDB tables.
            </p>
            <div className="tech-tags">
              <span className="tech-tag">DynamoDB</span>
              <span className="tech-tag">NoSQL</span>
              <span className="tech-tag">Pay-per-request</span>
            </div>
          </div>
        </div>

        {/* Security / Auth Lateral Layer */}
        <div className="lateral-security-row">
          <div className="security-card">
            <div className="security-icon-wrap">
              <Lock size={18} />
            </div>
            <div>
              <h5 className="sec-title">Amazon Cognito Authentication & Authorization</h5>
              <p className="sec-desc">
                Cognito sign-in and owner-based model authorization keep each account's records separate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Technical Pillars */}
      <div className="technical-pillars-grid">
        <div className="card pillar-card">
          <div className="pillar-header">
            <Zap size={18} className="pillar-icon" />
            <h4 className="pillar-title">Why AWS Amplify Gen 2?</h4>
          </div>
          <p className="pillar-text">
            Amplify Gen 2 introduces a <strong>code-first TypeScript developer experience</strong> powered by AWS CDK. Unlike legacy Gen 1 that relied on CLI prompts and nested CloudFormation JSON/YAML, Gen 2 definitions live entirely in type-safe TypeScript files in the <code>amplify/</code> directory.
          </p>
          <ul className="pillar-bullets">
            <li><strong>End-to-End Type Safety:</strong> Client data client inherits generated types automatically from backend schema.</li>
            <li><strong>Zero YAML drift:</strong> Infrastructure changes compile-time checked via <code>tsc</code>.</li>
            <li><strong>Instant Cloud Sandbox:</strong> Every developer gets an isolated AWS sandbox in minutes via <code>npx ampx sandbox</code>.</li>
          </ul>
        </div>

        <div className="card pillar-card">
          <div className="pillar-header">
            <ShieldCheck size={18} className="pillar-icon" />
            <h4 className="pillar-title">GraphQL vs Traditional REST</h4>
          </div>
          <p className="pillar-text">
            For business analytics dashboards requiring aggregated numbers across sales, costs, products, and customers:
          </p>
          <ul className="pillar-bullets">
            <li><strong>Typed operations:</strong> Amplify Data generates TypeScript clients from the backend schema for CRUD operations.</li>
            <li><strong>Owner-protected records:</strong> Cognito sign-in scopes each user's data access.</li>
            <li><strong>Managed persistence:</strong> AppSync resolves model operations to DynamoDB tables.</li>
          </ul>
        </div>
      </div>

      {/* Code Inspector */}
      <div className="card code-inspector-card">
        <div className="code-header">
          <div className="code-tabs">
            <button
              className={`code-tab ${activeCodeTab === 'schema' ? 'active' : ''}`}
              onClick={() => setActiveCodeTab('schema')}
            >
              <FileCode size={14} />
              <span>amplify/data/resource.ts</span>
            </button>
            <button
              className={`code-tab ${activeCodeTab === 'auth' ? 'active' : ''}`}
              onClick={() => setActiveCodeTab('auth')}
            >
              <Lock size={14} />
              <span>amplify/auth/resource.ts</span>
            </button>
            <button
              className={`code-tab ${activeCodeTab === 'backend' ? 'active' : ''}`}
              onClick={() => setActiveCodeTab('backend')}
            >
              <Server size={14} />
              <span>amplify/backend.ts</span>
            </button>
          </div>

          <button
            className="btn btn-ghost btn-xs copy-code-btn"
            onClick={() => {
              const text =
                activeCodeTab === 'schema'
                  ? schemaSnippet
                  : activeCodeTab === 'auth'
                  ? authSnippet
                  : backendSnippet;
              handleCopy(text, activeCodeTab);
            }}
          >
            {copiedText === activeCodeTab ? (
              <>
                <CheckCircle size={13} className="text-success" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="code-block">
          <code>
            {activeCodeTab === 'schema' && schemaSnippet}
            {activeCodeTab === 'auth' && authSnippet}
            {activeCodeTab === 'backend' && backendSnippet}
          </code>
        </pre>
      </div>

      {/* Live Deployment Guide */}
      <div className="card deploy-guide-card">
        <div className="guide-header">
          <Terminal size={18} className="text-primary" />
          <h4 className="guide-title">How to Connect to Live AWS Cloud</h4>
        </div>
        <p className="guide-desc">
          To transition from local PC evaluation to a live AWS cloud environment, run the following commands with an active AWS account:
        </p>

        <div className="terminal-steps">
          <div className="terminal-step">
            <div className="step-num">1</div>
            <div className="step-content">
              <span className="step-label">Configure AWS Credentials:</span>
              <div className="cmd-box">
                <code>aws configure</code>
              </div>
            </div>
          </div>

          <div className="terminal-step">
            <div className="step-num">2</div>
            <div className="step-content">
              <span className="step-label">Start personal cloud sandbox:</span>
              <div className="cmd-box">
                <code>npx ampx sandbox</code>
              </div>
              <span className="step-tip">
                This synthesizes the AWS CDK app and provisions AppSync + DynamoDB + Cognito in your AWS account in under 3 minutes.
              </span>
            </div>
          </div>

          <div className="terminal-step">
            <div className="step-num">3</div>
            <div className="step-content">
              <span className="step-label">Automated outputs sync:</span>
              <p className="step-text">
                The sandbox writes the generated API endpoints, GraphQL URLs, and Cognito identifiers directly into <code>amplify_outputs.json</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
