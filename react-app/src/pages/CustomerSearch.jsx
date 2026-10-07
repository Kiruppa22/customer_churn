import { useState } from "react";
import api from "../api";

function CustomerSearch() {
  // customerId: text typed in the box, customer: result from the backend
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Looks up one customer by ID
  const handleSearch = async () => {
    if (!customerId.trim()) return;

    setLoading(true);
    setError(null);
    setCustomer(null);

    try {
      // The /profile endpoint is the only one that returns contract type,
      // monthly charges, internet service and churn status together.
      // Tenure is not returned by this endpoint, so it is not displayed.
      const res = await api.get(`/customers/${customerId}/profile`);
      setCustomer(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("No customer found with that ID.");
      } else {
        setError("Something went wrong while looking up the customer.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Clears the search box and any result or error message
  const handleClear = () => {
    setCustomerId("");
    setCustomer(null);
    setError(null);
  };

  // Lets the user press Enter to search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div>
      <div className="card">
        <h2>Find a Customer</h2>
        <p className="muted">Enter a customer ID to view their profile.</p>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            type="text"
            placeholder="Customer ID, e.g. 7590-VHVEG"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ flex: 1 }}
          />
          <button className="primary" onClick={handleSearch} disabled={loading}>
            {loading ? "Looking up..." : "Find"}
          </button>
          <button className="secondary" onClick={handleClear} disabled={loading}>
            Clear
          </button>
        </div>
      </div>

      {loading && <p className="muted">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* Customer details table, shown only when a customer was found */}
      {customer && (
        <div className="card">
          <h3>{customer.customer_id}</h3>
          <table>
            <tbody>
              <tr>
                <td>Gender</td>
                <td>{customer.gender}</td>
              </tr>
              <tr>
                <td>Contract Type</td>
                <td>{customer.contract_type}</td>
              </tr>
              <tr>
                <td>Internet Service</td>
                <td>{customer.internet_service}</td>
              </tr>
              <tr>
                <td>Monthly Charges</td>
                <td>${Number(customer.monthly_charges).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Total Charges</td>
                <td>
                  {customer.total_charges != null
                    ? `$${Number(customer.total_charges).toFixed(2)}`
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td>Current Status</td>
                <td>
                  <span
                    className={`badge ${customer.churn === 1 ? "churned" : "active"}`}
                  >
                    {customer.churn === 1 ? "Churned" : "Active"}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default CustomerSearch;