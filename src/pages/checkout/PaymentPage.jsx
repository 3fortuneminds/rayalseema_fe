import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../../components/Button";
import { toast } from "../../components/Toast";
import { getOrder } from "../../services/orderApi";
import { createPayment, verifyPayment } from "../../services/paymentApi";
import { loadRazorpayScript } from "../../services/razorpay";
import { clearCart } from "../../store/cartSlice";

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [order, setOrder] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // The order already exists server-side at this point, so it's safe to
    // clear the cart once we've landed on the payment step.
    dispatch(clearCart());

    getOrder(orderId)
      .then(({ data }) => {
        setOrder(data.data);
        if (data.data.payment_status === "paid") {
          navigate(`/orders/${orderId}`, { replace: true });
        }
      })
      .catch(() => toast.error("Order not found"));

    createPayment(orderId)
      .then(({ data }) => setPaymentInfo(data.data))
      .catch(() => toast.error("Could not start payment"));
  }, [orderId, navigate]);

  const handleStubPay = async () => {
    setProcessing(true);
    try {
      await verifyPayment({ order_id: orderId });
      toast.success("Payment successful");
      navigate(`/orders/${orderId}`);
    } catch {
      toast.error("Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  const handleRazorpayPay = async () => {
    setProcessing(true);
    try {
      await loadRazorpayScript();
      const rzp = new window.Razorpay({
        key: paymentInfo.key_id,
        amount: paymentInfo.amount,
        currency: paymentInfo.currency,
        order_id: paymentInfo.razorpay_order_id,
        name: "Rayalseema",
        description: `Order #${orderId.slice(0, 8)}`,
        prefill: { email: user?.email, name: user?.full_name },
        handler: async (response) => {
          try {
            await verifyPayment({
              order_id: orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful");
            navigate(`/orders/${orderId}`);
          } catch {
            toast.error("Payment verification failed");
          } finally {
            setProcessing(false);
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
      });
      rzp.open();
    } catch {
      toast.error("Could not load payment gateway");
      setProcessing(false);
    }
  };

  if (!order || !paymentInfo) return <div className="page-loading">Preparing payment…</div>;

  return (
    <div className="payment-page">
      <div className="card payment-card">
        <h1>Complete payment</h1>
        <p className="payment-amount">₹{Number(order.total_amount).toFixed(0)}</p>
        <p className="payment-meta">Order from {order.restaurant_name}</p>

        {paymentInfo.stub ? (
          <>
            <div className="stub-banner">Payment gateway is in stub mode — no real charge will occur.</div>
            <Button onClick={handleStubPay} disabled={processing}>
              {processing ? "Processing…" : "Simulate payment"}
            </Button>
          </>
        ) : (
          <Button onClick={handleRazorpayPay} disabled={processing}>
            {processing ? "Opening Razorpay…" : "Pay with Razorpay"}
          </Button>
        )}
      </div>
    </div>
  );
}
