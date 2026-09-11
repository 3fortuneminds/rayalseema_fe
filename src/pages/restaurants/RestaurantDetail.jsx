import { motion } from "framer-motion";
import { Heart, MapPin, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import MenuFoodCard from "../../components/MenuFoodCard";
import StarRating from "../../components/StarRating";
import { toast } from "../../components/Toast";
import { getFoodCategories, listFoods, unwishlistFood, wishlistFood } from "../../services/foodApi";
import { favoriteRestaurant, getRestaurant, unfavoriteRestaurant } from "../../services/restaurantApi";
import { listReviews } from "../../services/reviewApi";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function RestaurantDetail() {
  const { slug } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setRestaurant(null);
    setNotFound(false);

    getRestaurant(slug)
      .then(({ data }) => setRestaurant(data.data))
      .catch(() => setNotFound(true));

    listFoods({ restaurant: slug })
      .then(({ data }) => setFoods(data.data))
      .catch(() => {});

    getFoodCategories(slug)
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});

    listReviews(slug)
      .then(({ data }) => setReviews(data.data))
      .catch(() => {});
  }, [slug]);

  const handleToggleFavorite = async () => {
    try {
      if (restaurant.is_favorited) {
        await unfavoriteRestaurant(slug);
      } else {
        await favoriteRestaurant(slug);
      }
      setRestaurant((r) => ({ ...r, is_favorited: !r.is_favorited }));
    } catch {
      toast.error("Could not update favorites");
    }
  };

  const handleToggleWishlist = async (food) => {
    try {
      if (food.is_wishlisted) {
        await unwishlistFood(food.id);
      } else {
        await wishlistFood(food.id);
      }
      setFoods((fs) => fs.map((f) => (f.id === food.id ? { ...f, is_wishlisted: !f.is_wishlisted } : f)));
    } catch {
      toast.error("Could not update wishlist");
    }
  };

  const categoryName = useMemo(() => {
    const map = {};
    categories.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categories]);

  const groupedFoods = useMemo(() => {
    const groups = {};
    foods.forEach((f) => {
      const key = f.category ?? "other";
      groups[key] = groups[key] || [];
      groups[key].push(f);
    });
    return groups;
  }, [foods]);

  if (notFound) return <div className="empty-state">Restaurant not found.</div>;
  if (!restaurant) return <div className="page-loading">Loading…</div>;

  const today = (new Date().getDay() + 6) % 7; // Mon=0..Sun=6, matches backend Weekday

  return (
    <div className="restaurant-detail">
      <div className="restaurant-hero">
        <motion.div
          className="restaurant-hero-media"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {restaurant.cover_image ? (
            <img src={restaurant.cover_image} alt="" />
          ) : (
            <span className="restaurant-card-media-fallback">🍽️</span>
          )}
        </motion.div>
        <div className="restaurant-hero-info">
          <div className="restaurant-hero-top">
            <h1>{restaurant.name}</h1>
            <button
              type="button"
              className={`favorite-btn${restaurant.is_favorited ? " active" : ""}`}
              onClick={handleToggleFavorite}
              title={restaurant.is_favorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={16} fill={restaurant.is_favorited ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="restaurant-hero-meta">
            <span className="rating-pill">
              <Star size={11} fill="currentColor" />
              {Number(restaurant.avg_rating).toFixed(1)}
            </span>
            <span>({restaurant.rating_count} ratings)</span>
            <span className="dot">·</span>
            <span>
              <MapPin size={12} /> {restaurant.city}
            </span>
          </p>
          {restaurant.categories?.length > 0 && (
            <p className="restaurant-card-meta">{restaurant.categories.map((c) => c.name).join(" · ")}</p>
          )}
          {restaurant.description && <p className="restaurant-hero-desc">{restaurant.description}</p>}
        </div>
      </div>

      <div className="restaurant-detail-grid">
        <div className="menu-column">
          {Object.keys(groupedFoods).length === 0 && <div className="empty-state">No menu items yet.</div>}
          {Object.entries(groupedFoods).map(([catId, items]) => (
            <section key={catId} className="menu-section">
              <h2>{categoryName[catId] ?? "Other"}</h2>
              <div className="food-grid">
                {items.map((f) => (
                  <MenuFoodCard key={f.id} food={f} restaurant={restaurant} onToggleWishlist={handleToggleWishlist} />
                ))}
              </div>
            </section>
          ))}

          <section className="menu-section">
            <h2>Reviews {reviews.length > 0 && `(${reviews.length})`}</h2>
            {reviews.length === 0 ? (
              <p className="restaurant-card-meta">No reviews yet.</p>
            ) : (
              <ul className="review-list">
                {reviews.map((r) => (
                  <li key={r.id} className="review-list-item">
                    <div className="review-list-top">
                      <strong>{r.user_name || "Customer"}</strong>
                      <StarRating value={r.rating} size={14} />
                    </div>
                    {r.comment && <p>{r.comment}</p>}
                    <span className="review-date">{new Date(r.created_at).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="card hours-card">
          <h3>Opening hours</h3>
          <ul className="opening-hours-list">
            {restaurant.opening_hours?.map((h) => (
              <li key={h.weekday} className={h.weekday === today ? "today" : ""}>
                <span>{WEEKDAY_LABELS[h.weekday]}</span>
                <span>{h.is_closed ? "Closed" : `${h.opens_at?.slice(0, 5)} – ${h.closes_at?.slice(0, 5)}`}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
