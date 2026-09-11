import { useEffect, useState } from "react";

import RestaurantCard from "../../components/RestaurantCard";
import { toast } from "../../components/Toast";
import { listFavoriteRestaurants, unfavoriteRestaurant } from "../../services/restaurantApi";

export default function Favorites() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listFavoriteRestaurants()
      .then(({ data }) => setRestaurants(data.data))
      .catch(() => toast.error("Could not load favorites"))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFavorite = async (restaurant) => {
    try {
      await unfavoriteRestaurant(restaurant.slug);
      setRestaurants((rs) => rs.filter((r) => r.id !== restaurant.id));
    } catch {
      toast.error("Could not update favorites");
    }
  };

  return (
    <div className="browse-page">
      <div className="page-header">
        <div>
          <h1>Favorites</h1>
          <p>Restaurants you've saved for later</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">No favorites yet — tap the heart on any restaurant to save it here.</div>
      ) : (
        <div className="restaurant-grid">
          {restaurants.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} onToggleFavorite={handleToggleFavorite} />
          ))}
        </div>
      )}
    </div>
  );
}
