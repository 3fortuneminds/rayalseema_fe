import { Heart, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function RestaurantCard({ restaurant, onToggleFavorite }) {
  return (
    <div className="restaurant-card">
      <Link to={`/restaurants/${restaurant.slug}`} className="restaurant-card-media">
        {restaurant.cover_image ? (
          <img src={restaurant.cover_image} alt="" />
        ) : (
          <span className="restaurant-card-media-fallback">🍽️</span>
        )}
        <span className="restaurant-card-badge">Featured</span>
      </Link>
      {onToggleFavorite && (
        <button
          type="button"
          className={`favorite-btn${restaurant.is_favorited ? " active" : ""}`}
          onClick={() => onToggleFavorite(restaurant)}
          title={restaurant.is_favorited ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={15} fill={restaurant.is_favorited ? "currentColor" : "none"} />
        </button>
      )}
      <Link to={`/restaurants/${restaurant.slug}`} className="restaurant-card-body">
        <div className="restaurant-card-top">
          <h3>{restaurant.name}</h3>
          <span className="rating-pill">
            <Star size={11} fill="currentColor" />
            {Number(restaurant.avg_rating).toFixed(1)}
          </span>
        </div>
        {restaurant.categories?.length > 0 && (
          <p className="restaurant-card-meta">{restaurant.categories.map((c) => c.name).join(" · ")}</p>
        )}
        <p className="restaurant-card-city">
          <MapPin size={12} />
          {restaurant.city}
          {restaurant.distance_km != null && ` · ${restaurant.distance_km} km`}
        </p>
      </Link>
    </div>
  );
}
