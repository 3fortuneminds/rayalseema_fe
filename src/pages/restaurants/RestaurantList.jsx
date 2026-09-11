import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import RestaurantCard from "../../components/RestaurantCard";
import { toast } from "../../components/Toast";
import {
  favoriteRestaurant,
  getRestaurantCategories,
  listRestaurants,
  unfavoriteRestaurant,
} from "../../services/restaurantApi";

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurantCategories()
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeCategory) params.category = activeCategory;
    if (searchTerm) params.search = searchTerm;
    if (sort) params.ordering = sort;

    listRestaurants(params)
      .then(({ data }) => setRestaurants(data.data))
      .catch(() => toast.error("Could not load restaurants"))
      .finally(() => setLoading(false));
  }, [activeCategory, searchTerm, sort]);

  const handleToggleFavorite = async (restaurant) => {
    try {
      if (restaurant.is_favorited) {
        await unfavoriteRestaurant(restaurant.slug);
      } else {
        await favoriteRestaurant(restaurant.slug);
      }
      setRestaurants((rs) => rs.map((r) => (r.id === restaurant.id ? { ...r, is_favorited: !r.is_favorited } : r)));
    } catch {
      toast.error("Could not update favorites");
    }
  };

  return (
    <div className="browse-page">
      <div className="page-header">
        <div>
          <h1>Restaurants</h1>
          <p>Order from the best places near you</p>
        </div>
      </div>

      <div className="browse-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Search restaurants…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sort: Featured</option>
          <option value="-rating">Rating: High to low</option>
          <option value="rating">Rating: Low to high</option>
        </select>
      </div>

      <div className="category-chips">
        <button type="button" className={`chip${!activeCategory ? " active" : ""}`} onClick={() => setActiveCategory(null)}>
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chip${activeCategory === c.slug ? " active" : ""}`}
            onClick={() => setActiveCategory(c.slug)}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : restaurants.length === 0 ? (
        <div className="empty-state">No restaurants match your filters.</div>
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
