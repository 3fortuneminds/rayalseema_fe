import { Download } from "lucide-react";
import { useState } from "react";

import Button from "../../components/Button";
import { toast } from "../../components/Toast";
import { downloadSalesReportCsv, getSalesReport } from "../../services/analyticsApi";

function isoDaysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default function SalesReports() {
  const [start, setStart] = useState(isoDaysAgo(6));
  const [end, setEnd] = useState(isoDaysAgo(0));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runReport = async (e) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const { data } = await getSalesReport(start, end);
      setReport(data.data);
    } catch {
      toast.error("Could not load report");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await downloadSalesReportCsv(start, end);
    } catch {
      toast.error("Could not export CSV");
    }
  };

  const totals = (report ?? []).reduce(
    (acc, row) => ({ orders: acc.orders + row.order_count, revenue: acc.revenue + Number(row.revenue) }),
    { orders: 0, revenue: 0 }
  );

  return (
    <div className="sales-reports-page">
      <div className="page-header">
        <div>
          <h1>Sales reports</h1>
          <p>Revenue and order counts by day</p>
        </div>
      </div>

      <div className="card">
        <form className="report-filter-row" onSubmit={runReport}>
          <div className="input-group">
            <label htmlFor="start">From</label>
            <input id="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div className="input-group">
            <label htmlFor="end">To</label>
            <input id="end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Loading…" : "Run report"}
          </Button>
          {report && (
            <Button type="button" variant="secondary" onClick={handleExport}>
              <Download size={15} /> Export CSV
            </Button>
          )}
        </form>
      </div>

      {report && (
        <div className="card">
          {report.length === 0 ? (
            <div className="empty-state">No paid orders in this range.</div>
          ) : (
            <table className="report-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {report.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date}</td>
                    <td>{row.order_count}</td>
                    <td>₹{Number(row.revenue).toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td>Total</td>
                  <td>{totals.orders}</td>
                  <td>₹{totals.revenue.toFixed(0)}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
