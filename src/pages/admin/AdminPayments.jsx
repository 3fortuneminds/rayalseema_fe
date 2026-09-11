import { Fragment, useEffect, useState } from "react";

import { toast } from "../../components/Toast";
import { issueRefund, listAdminPayments } from "../../services/adminApi";

function RefundForm({ payment, onDone }) {
  const remaining = Number(payment.amount) - Number(payment.refunded_amount);
  const [amount, setAmount] = useState(remaining > 0 ? remaining : 0);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await issueRefund(payment.id, { amount, reason });
      toast.success("Refund issued");
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not issue refund");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="refund-form">
      <input
        type="number"
        min="0"
        max={remaining}
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <input type="text" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
      <button type="submit" className="btn btn-primary btn-sm" disabled={busy || remaining <= 0}>
        {busy ? "Refunding…" : "Refund"}
      </button>
    </form>
  );
}

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundingId, setRefundingId] = useState(null);

  const refresh = () => {
    setLoading(true);
    listAdminPayments()
      .then(({ data }) => setPayments(data.data))
      .catch(() => toast.error("Could not load payments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="admin-list-page">
      <div className="page-header">
        <div>
          <h1>Payments & refunds</h1>
          <p>View transactions and issue refunds</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Refunded</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => {
                const remaining = Number(p.amount) - Number(p.refunded_amount);
                return (
                  <Fragment key={p.id}>
                    <tr>
                      <td>#{p.order_id.slice(0, 8)}</td>
                      <td>{p.customer_email}</td>
                      <td>₹{Number(p.amount).toFixed(0)}</td>
                      <td>
                        <span className={`badge status-${p.status === "success" ? "delivered" : "cancelled"}`}>
                          {p.status}
                        </span>
                      </td>
                      <td>₹{Number(p.refunded_amount).toFixed(0)}</td>
                      <td>{new Date(p.created_at).toLocaleDateString()}</td>
                      <td>
                        {p.status === "success" && remaining > 0 && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setRefundingId(refundingId === p.id ? null : p.id)}
                          >
                            {refundingId === p.id ? "Cancel" : "Issue refund"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {refundingId === p.id && (
                      <tr>
                        <td colSpan={7}>
                          <RefundForm
                            payment={p}
                            onDone={() => {
                              setRefundingId(null);
                              refresh();
                            }}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    No payments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
