import { Heart } from "lucide-react";

export default function FoodCard({ food, onToggleWishlist }) {
  return (
    <div className="food-card">
      <div className="food-card-media">
        {food.image ? <img src={food.image} alt="" /> : <span className="food-card-media-fallback">🍲</span>}
      </div>
      <div className="food-card-body">
        <div className="food-card-top">
          <h4>
            <span className={`veg-dot ${food.is_vegetarian ? "veg" : "non-veg"}`} title={food.is_vegetarian ? "Vegetarian" : "Non-vegetarian"} />
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
        <p className="food-card-price">₹{Number(food.base_price).toFixed(0)}</p>
      </div>
    </div>
  );
}
