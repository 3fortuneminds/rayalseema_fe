import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import { listAddresses } from "../../services/addressApi";
import { validateCoupon } from "../../services/couponApi";
import { createOrder } from "../../services/orderApi";

const DELIVERY_FEE_ESTIMATE = 30;

export default function CheckoutPage() {
  const cart = useSelector((state) => state.cart);
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [placing, setPlacing] = useState(false);

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = coupon?.discount_amount ?? 0;
  const estimatedTotal = subtotal + DELIVERY_FEE_ESTIMATE - discount;

  useEffect(() => {
    listAddresses()
      .then(({ data }) => {
        setAddresses(data.data);
        const defaultAddress = data.data.find((a) => a.is_default) ?? data.data[0];
        if (defaultAddress) setAddressId(defaultAddress.id);
      })
      .catch(() => toast.error("Could not load addresses"));
  }, []);

  if (cart.items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const { data } = await validateCoupon(couponCode.trim(), subtotal);
      setCoupon(data.data);
      toast.success("Coupon applied");
    } catch (err) {
      setCoupon(null);
      setCouponError(err.response?.data?.message ?? "Invalid coupon");
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!addressId) {
      toast.error("Select a delivery address");
      return;
    }
    setPlacing(true);
    try {
      const { data } = await createOrder({
        address_id: addressId,
        items: cart.items.map((i) => ({ food_id: i.foodId, variant_id: i.variantId, quantity: i.quantity })),
        coupon_code: coupon ? coupon.code : undefined,
      });
      navigate(`/checkout/pay/${data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="page-header">
        <div>
          <h1>Checkout</h1>
          <p>Ordering from {cart.restaurantName}</p>
        </div>
      </div>

      <div className="checkout-grid">
        <div className="checkout-main">
          <section className="card">
            <h2>Delivery address</h2>
            {addresses.length === 0 ? (
              <p className="empty-state">
                No addresses saved.{" "}
                <Link to="/addresses" className="link-inline">
                  Add one
                </Link>
              </p>
            ) : (
              <div className="address-select-list">
                {addresses.map((a) => (
                  <label key={a.id} className={`address-select-card${addressId === a.id ? " selected" : ""}`}>
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === a.id}
                      onChange={() => setAddressId(a.id)}
                    />
                    <div>
                      <strong>{a.label || "Address"}</strong>
                      <p>
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.state} {a.postal_code}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </section>

          <section className="card">
            <h2>Coupon</h2>
            <div className="coupon-row">
              <Input
                name="coupon_code"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                error={couponError}
              />
              <Button variant="secondary" onClick={handleApplyCoupon} disabled={applyingCoupon}>
                {applyingCoupon ? "Checking…" : "Apply"}
              </Button>
            </div>
            {coupon && (
              <p className="coupon-applied">
                "{coupon.code}" applied — you save ₹{Number(coupon.discount_amount).toFixed(0)}
              </p>
            )}
          </section>
        </div>

        <aside className="card checkout-summary">
          <h2>Order summary</h2>
          <ul className="checkout-summary-items">
            {cart.items.map((item) => (
              <li key={`${item.foodId}:${item.variantId ?? ""}`}>
                <span>
                  {item.quantity} × {item.name}
                  {item.variantName && ` (${item.variantName})`}
                </span>
                <span>₹{(item.price * item.quantity).toFixed(0)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(0)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery fee (est.)</span>
            <span>₹{DELIVERY_FEE_ESTIMATE}</span>
          </div>
          {discount > 0 && (
            <div className="summary-row discount">
              <span>Coupon discount</span>
              <span>-₹{Number(discount).toFixed(0)}</span>
            </div>
          )}
          <div className="summary-row total">
            <span>Estimated total</span>
            <span>₹{estimatedTotal.toFixed(0)}</span>
          </div>
          <Button onClick={handlePlaceOrder} disabled={placing || !addressId}>
            {placing ? "Placing order…" : "Place order"}
          </Button>
        </aside>
      </div>
    </div>
  );
}
