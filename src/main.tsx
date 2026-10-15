import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

// Configure Amplify if cloud backend config outputs are present
try {
  if (outputs && Object.keys(outputs).length > 0) {
    Amplify.configure(outputs);
  }
} catch (err) {
  console.info("Amplify running in offline/local evaluation mode:", err);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
