import { useState, useEffect } from "react";
import api from "./api";
import CustomerSearch from "./pages/CustomerSearch";
import ChurnSummary from "./pages/ChurnSummary";
import HighRiskCustomers from "./pages/HighRiskCustomers";
import ChurnPrediction from "./pages/ChurnPrediction";
import "./App.css";

// List of dashboard tabs. Each tab has an id, a label shown in the
// navigation bar, and the page component that is displayed for it.
const TABS = [
  { id: "summary", label: "Overview", component: ChurnSummary },
  { id: "search", label: "Find Customer", component: CustomerSearch },
  { id: "highrisk", label: "At-Risk Customers", component: HighRiskCustomers },
  { id: "predict", label: "Risk Predictor", component: ChurnPrediction },
];

function App() {
  // Keeps track of which tab is currently open
  const [activeTab, setActiveTab] = useState("summary");

  // Runs once when the app loads: checks that the backend API is reachable
  // and that CORS is configured correctly. The result is only logged to
  // the browser console.
  useEffect(() => {
    api
      .get("/churn/summary")
      .then((res) => {
        console.log("API connectivity check OK:", res.data);
      })
      .catch((err) => {
        console.error("API connectivity check FAILED:", err);
      });
  }, []);

  // Finds the component that belongs to the selected tab
  const ActiveComponent = TABS.find((t) => t.id === activeTab).component;

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Churn Insights Dashboard</h1>
        <p className="muted">Track, search and predict customer churn in one place.</p>
      </header>

      {/* Tab navigation bar */}
      <nav className="tab-nav">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "tab active" : "tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Shows the page for the selected tab */}
      <main className="tab-content">
        <ActiveComponent />
      </main>
    </div>
  );
}

export default App;