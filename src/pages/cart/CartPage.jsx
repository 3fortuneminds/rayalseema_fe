import { Minus, Plus, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import Button from "../../components/Button";
import { removeItem, updateQuantity } from "../../store/cartSlice";

function lineKey(item) {
  return `${item.foodId}:${item.variantId ?? ""}`;
}

export default function CartPage() {
  const cart = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        Your cart is empty.{" "}
        <Link to="/restaurants" className="link-inline">
          Browse restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <div>
          <h1>Your cart</h1>
          <p>Ordering from {cart.restaurantName}</p>
        </div>
      </div>

      <div className="card cart-items">
        {cart.items.map((item) => (
          <div key={lineKey(item)} className="cart-line">
            <div className="cart-line-info">
              <h4>
                {item.name}
                {item.variantName && <span className="cart-line-variant"> ({item.variantName})</span>}
              </h4>
              <p className="cart-line-unit">₹{item.price} each</p>
            </div>
            <div className="qty-stepper">
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    updateQuantity({ foodId: item.foodId, variantId: item.variantId, quantity: item.quantity - 1 })
                  )
                }
              >
                <Minus size={13} />
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    updateQuantity({ foodId: item.foodId, variantId: item.variantId, quantity: item.quantity + 1 })
                  )
                }
              >
                <Plus size={13} />
              </button>
            </div>
            <p className="cart-line-total">₹{(item.price * item.quantity).toFixed(0)}</p>
            <button
              type="button"
              className="icon-btn"
              onClick={() => dispatch(removeItem({ foodId: item.foodId, variantId: item.variantId }))}
              title="Remove"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="card cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₹{subtotal.toFixed(0)}</span>
        </div>
        <p className="cart-summary-hint">Delivery fee and any coupon discount are applied at checkout.</p>
        <Button onClick={() => navigate("/checkout")}>Proceed to checkout</Button>
      </div>
    </div>
  );
}
