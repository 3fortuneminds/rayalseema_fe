import { Copy, Percent } from "lucide-react";
import { useEffect, useState } from "react";

import { toast } from "../../components/Toast";
import { listActiveCoupons } from "../../services/couponApi";

function formatDiscount(coupon) {
  if (coupon.discount_type === "percentage") {
    const capped = coupon.max_discount_amount ? ` up to ₹${Number(coupon.max_discount_amount)}` : "";
    return `${Number(coupon.discount_value)}% off${capped}`;
  }
  return `₹${Number(coupon.discount_value)} off`;
}

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listActiveCoupons()
      .then(({ data }) => setCoupons(data.data))
      .catch(() => toast.error("Could not load offers"))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success(`Copied ${code}`);
    } catch {
      toast.error("Could not copy code");
    }
  };

  return (
    <div className="browse-page">
      <div className="page-header">
        <div>
          <h1>Offers</h1>
          <p>Apply a coupon code at checkout to save on your order</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : coupons.length === 0 ? (
        <div className="empty-state">No active offers right now — check back soon.</div>
      ) : (
        <div className="offer-grid">
          {coupons.map((c) => (
            <div key={c.code} className="offer-card">
              <span className="offer-card-icon">
                <Percent size={18} />
              </span>
              <div className="offer-card-body">
                <strong>{c.code}</strong>
                <p>{c.description || formatDiscount(c)}</p>
                {Number(c.min_order_amount) > 0 && (
                  <span className="offer-card-min">Min. order ₹{Number(c.min_order_amount)}</span>
                )}
              </div>
              <button type="button" className="offer-card-copy" onClick={() => handleCopy(c.code)}>
                <Copy size={14} />
                Copy
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
