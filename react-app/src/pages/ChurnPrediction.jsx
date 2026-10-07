import { useState } from "react";
import api from "../api";

// Risk score limits (the backend sends a 0-1 fraction)
// below LOW_RISK_LIMIT = low, below MEDIUM_RISK_LIMIT = medium, otherwise high
const LOW_RISK_LIMIT = 0.35;
const MEDIUM_RISK_LIMIT = 0.65;

// Starting (empty) values for the form
const initialForm = {
  tenure: "",
  monthly_charges: "",
  contract_type: "Month-to-month",
  service_count: "",
};

// Converts the 0-1 risk score into a label used for the badge
const getRiskLevel = (fraction) => {
  if (fraction < LOW_RISK_LIMIT) return "low";
  if (fraction < MEDIUM_RISK_LIMIT) return "medium";
  return "high";
};

function ChurnPrediction() {
  // form: values typed by the user, result: prediction from the backend
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Returns a handler that updates one field of the form
  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  // Sends the form values to the backend and stores the prediction
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/predict-churn", {
        tenure: Number(form.tenure),
        monthly_charges: Number(form.monthly_charges),
        contract_type: form.contract_type,
        service_count: Number(form.service_count),
      });
      setResult(res.data);
    } catch (err) {
      if (err.response?.status === 422) {
        // Validation error from the backend
        const detail = err.response.data?.detail;
        setError(
          Array.isArray(detail)
            ? detail.map((d) => d.msg).join(", ")
            : detail || "Please check the values you entered."
        );
      } else if (err.response?.status === 401) {
        setError("Unauthorized: please check the API key configuration.");
      } else {
        setError("The prediction request failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Clears the form, the result and any error message
  const handleReset = () => {
    setForm(initialForm);
    setResult(null);
    setError(null);
  };

  return (
    <div>
      <div className="card">
        <h2>Risk Predictor</h2>
        <p className="muted">Fill in the customer details to estimate their chance of leaving.</p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <label>
            Months with the Company
            <input
              type="number"
              min="0"
              required
              value={form.tenure}
              onChange={handleChange("tenure")}
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Monthly Bill ($)
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={form.monthly_charges}
              onChange={handleChange("monthly_charges")}
              style={{ width: "100%" }}
            />
          </label>

          <label>
            Contract Plan
            <select
              value={form.contract_type}
              onChange={handleChange("contract_type")}
              style={{ width: "100%" }}
            >
              <option>Month-to-month</option>
              <option>One year</option>
              <option>Two year</option>
            </select>
          </label>

          <label>
            Services Subscribed (0-6)
            <input
              type="number"
              min="0"
              max="6"
              required
              value={form.service_count}
              onChange={handleChange("service_count")}
              style={{ width: "100%" }}
            />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Calculating..." : "Check Churn Risk"}
            </button>
            <button
              className="secondary"
              type="button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {error && <p className="error-text">{error}</p>}

      {/* Prediction result, shown only after a successful request */}
      {result && (
        <div className="card">
          {(() => {
            const level = getRiskLevel(result.risk_score);
            return (
              <>
                <h3>
                  Churn Risk: {(result.risk_score * 100).toFixed(1)}%{" "}
                  <span className={`badge ${level}`}>{level.toUpperCase()}</span>
                </h3>
                <p>{result.prediction}</p>
                {result.confidence != null && (
                  <p className="muted">
                    Model confidence: {(result.confidence * 100).toFixed(1)}%
                  </p>
                )}
                {result.note && <p className="muted">{result.note}</p>}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default ChurnPrediction;