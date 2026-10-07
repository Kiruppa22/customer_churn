import { useState, useEffect } from "react";
import api from "../api";

function HighRiskCustomers() {
  // customers: list from the backend, limit: how many rows to request
  const [customers, setCustomers] = useState([]);
  const [limit, setLimit] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // sortAsc: current direction of the monthly charges sort
  const [sortAsc, setSortAsc] = useState(true);

  // Loads the list when the page opens and whenever the limit changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    // The backend currently ignores query parameters, so changing the
    // limit will not change the results yet. The limit is still sent so
    // this page keeps working once the backend supports it.
    api
      .get("/customers/high-risk", { params: { limit } })
      .then((res) => setCustomers(res.data))
      .catch(() => setError("Could not load the at-risk customers."))
      .finally(() => setLoading(false));
  }, [limit]);

  // Sorts the table by monthly charges and flips the direction each click.
  // (Tenure is not in this endpoint's response, so charges are used.)
  const handleSort = () => {
    setCustomers([...customers].sort((a, b) => {
      return sortAsc
        ? a.monthly_charges - b.monthly_charges
        : b.monthly_charges - a.monthly_charges;
    }));
    setSortAsc(!sortAsc);
  };

  return (
    <div>
      <div className="card">
        <h2>At-Risk Customers</h2>
        <p className="muted">
          {loading
            ? "Loading..."
            : `${customers.length} customers are at high risk of leaving`}
        </p>
      </div>

      {error && <p className="error-text">{error}</p>}

      {!loading && !error && customers.length === 0 && (
        <p className="muted">No at-risk customers right now.</p>
      )}

      {/* Table of at-risk customers */}
      {!loading && customers.length > 0 && (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Gender</th>
                <th>Contract</th>
                <th onClick={handleSort}>
                  Monthly Charges {sortAsc ? "▲" : "▼"}
                </th>
                <th>Internet</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.customer_id}>
                  <td>{c.customer_id}</td>
                  <td>{c.gender}</td>
                  <td>{c.contract_type}</td>
                  <td>${Number(c.monthly_charges).toFixed(2)}</td>
                  <td>{c.internet_service}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 12 }}>
            <button className="primary" onClick={() => setLimit(limit + 50)}>
              Show 50 More
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HighRiskCustomers;