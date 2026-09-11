import { Heart, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addItem, updateQuantity } from "../store/cartSlice";
import { toast } from "./Toast";

export default function MenuFoodCard({ food, restaurant, onToggleWishlist }) {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);
  const cartRestaurantId = useSelector((state) => state.cart.restaurantId);

  const defaultVariant = useMemo(() => {
    if (!food.variants?.length) return null;
    return food.variants.find((v) => v.is_default) ?? food.variants[0];
  }, [food.variants]);

  const [variantId, setVariantId] = useState(defaultVariant?.id ?? null);

  const selectedVariant = food.variants?.find((v) => v.id === variantId) ?? null;
  const price = selectedVariant ? Number(selectedVariant.price) : Number(food.base_price);

  const cartLine = cartItems.find((i) => i.foodId === food.id && (i.variantId ?? null) === (variantId ?? null));

  const handleAdd = () => {
    if (cartRestaurantId && cartRestaurantId !== restaurant.id && cartItems.length > 0) {
      toast("Started a new cart for this restaurant", { icon: "🛒" });
    }
    dispatch(
      addItem({
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantSlug: restaurant.slug,
        foodId: food.id,
        variantId,
        name: food.name,
        variantName: selectedVariant?.name ?? "",
        price,
        quantity: 1,
      })
    );
  };

  const handleChangeQty = (delta) => {
    dispatch(updateQuantity({ foodId: food.id, variantId, quantity: (cartLine?.quantity ?? 0) + delta }));
  };

  return (
    <div className="food-card">
      <div className="food-card-media">
        {food.image ? <img src={food.image} alt="" /> : <span className="food-card-media-fallback">🍲</span>}
      </div>
      <div className="food-card-body">
        <div className="food-card-top">
          <h4>
            <span
              className={`veg-dot ${food.is_vegetarian ? "veg" : "non-veg"}`}
              title={food.is_vegetarian ? "Vegetarian" : "Non-vegetarian"}
            />
            {food.name}
          </h4>
          {onToggleWishlist && (
            <button
              type="button"
              className={`wishlist-btn${food.is_wishlisted ? " active" : ""}`}
              onClick={() => onToggleWishlist(food)}
              title={food.is_wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={14} fill={food.is_wishlisted ? "currentColor" : "none"} />
            </button>
          )}
        </div>

        {food.description && <p className="food-card-desc">{food.description}</p>}

        {food.variants?.length > 1 && (
          <select className="variant-select" value={variantId ?? ""} onChange={(e) => setVariantId(e.target.value)}>
            {food.variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} — ₹{Number(v.price).toFixed(0)}
              </option>
            ))}
          </select>
        )}

        <div className="food-card-footer">
          <p className="food-card-price">₹{price.toFixed(0)}</p>
          {cartLine ? (
            <div className="qty-stepper">
              <button type="button" onClick={() => handleChangeQty(-1)}>
                <Minus size={13} />
              </button>
              <span>{cartLine.quantity}</span>
              <button type="button" onClick={() => handleChangeQty(1)}>
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAdd}>
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
