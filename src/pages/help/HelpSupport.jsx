import { Mail, MessageCircleQuestion, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const FAQS = [
  {
    q: "Where is my order?",
    a: "Track live status and the delivery partner's location from Orders → select your order.",
  },
  {
    q: "How do I cancel an order?",
    a: "Orders can be cancelled from the order detail page before the restaurant accepts it.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds for cancelled or failed orders are credited back to your original payment method within 5-7 business days.",
  },
  {
    q: "How do I apply a coupon?",
    a: "Enter the coupon code at checkout, or copy one from the Offers page first.",
  },
];

export default function HelpSupport() {
  return (
    <div className="browse-page">
      <div className="page-header">
        <div>
          <h1>Help &amp; Support</h1>
          <p>We're here if something's not right</p>
        </div>
      </div>

      <div className="help-contact-row">
        <a href="mailto:support@rayalseema.app" className="card help-contact-card">
          <span className="offer-card-icon">
            <Mail size={18} />
          </span>
          <div>
            <strong>Email us</strong>
            <p>support@rayalseema.app</p>
          </div>
        </a>
        <a href="tel:+911800123456" className="card help-contact-card">
          <span className="offer-card-icon">
            <Phone size={18} />
          </span>
          <div>
            <strong>Call us</strong>
            <p>1800-123-456 (9am - 9pm)</p>
          </div>
        </a>
        <Link to="/orders" className="card help-contact-card">
          <span className="offer-card-icon">
            <MessageCircleQuestion size={18} />
          </span>
          <div>
            <strong>Order issue?</strong>
            <p>Go to Orders for order-specific help</p>
          </div>
        </Link>
      </div>

      <div className="card help-faq-card">
        <h2>Frequently asked questions</h2>
        <dl className="help-faq-list">
          {FAQS.map(({ q, a }) => (
            <div key={q} className="help-faq-item">
              <dt>{q}</dt>
              <dd>{a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
