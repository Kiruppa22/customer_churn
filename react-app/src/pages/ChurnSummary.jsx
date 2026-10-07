import { useState, useEffect } from "react";
import api from "../api";

function ChurnSummary() {
  // data: summary returned by the backend, loading/error: request status
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the churn summary once when the page opens
  useEffect(() => {
    api
      .get("/churn/summary")
      .then((res) => setData(res.data))
      .catch(() => setError("Could not load the churn overview."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading...</p>;
  if (error) return <p className="error-text">{error}</p>;
  if (!data) return null;

  const { total_customers, churned_customers, churn_rate, by_contract } = data;

  // Extra figures calculated from the backend data
  const retainedCustomers = total_customers - churned_customers;
  const retentionRate = 100 - churn_rate;

  // The backend already sends churn_rate on a 0-100 scale, so the values
  // are shown directly without multiplying by 100 again.
  // maxRate is used to scale the bars (minimum 1 avoids dividing by zero).
  const maxRate = Math.max(...by_contract.map((c) => c.churn_rate), 1);

  return (
    <div>
      <div className="card">
        <h2>Churn Overview</h2>
        <p className="muted">A quick look at customer retention across the business.</p>
      </div>

      {/* Key numbers */}
      <div className="metric-row">
        <div className="metric-card">
          <div className="metric-value">{total_customers}</div>
          <div className="metric-label">All Customers</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{churned_customers}</div>
          <div className="metric-label">Customers Lost</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{retainedCustomers}</div>
          <div className="metric-label">Customers Retained</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{churn_rate.toFixed(1)}%</div>
          <div className="metric-label">Churn Rate</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{retentionRate.toFixed(1)}%</div>
          <div className="metric-label">Retention Rate</div>
        </div>
      </div>

      {/* Churn rate for each contract type, with a simple bar */}
      <div className="card">
        <h3>Churn by Contract Type</h3>
        <table>
          <thead>
            <tr>
              <th>Contract</th>
              <th>Customers</th>
              <th>Churn Rate</th>
            </tr>
          </thead>
          <tbody>
            {by_contract.map((row) => (
              <tr key={row.contract_type}>
                <td>{row.contract_type}</td>
                <td>{row.total}</td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="bar-track" style={{ width: 100 }}>
                      <div
                        className="bar-fill"
                        style={{ width: `${(row.churn_rate / maxRate) * 100}%` }}
                      />
                    </div>
                    <span>{row.churn_rate.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChurnSummary;