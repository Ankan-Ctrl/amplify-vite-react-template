import { lazy, StrictMode, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "../amplify_outputs.json";

const App = lazy(() => import("./App.tsx"));

Amplify.configure(outputs);
const config = Amplify.getConfig();
const hasRequiredBackend =
  Boolean(config.Auth?.Cognito?.userPoolId) &&
  Boolean(config.Auth?.Cognito?.userPoolClientId) &&
  Boolean(config.Auth?.Cognito?.identityPoolId) &&
  Boolean(config.API?.GraphQL?.endpoint) &&
  Boolean(config.Storage?.S3?.bucket && config.Storage.S3.region);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {hasRequiredBackend ? (
      <Authenticator loginMechanisms={["email"]}>
        <Suspense fallback={<p role="status">Loading BizPulse…</p>}>
          <App />
        </Suspense>
      </Authenticator>
    ) : (
      <main className="backend-required">
        <section>
          <h1>AWS backend is not configured</h1>
          <p>
            Deploy the latest Amplify backend to this branch and reload. BizPulse
            requires Cognito, AppSync, and S3 configuration; it does not use local
            browser storage as a fallback.
          </p>
        </section>
      </main>
    )}
  </StrictMode>
);
