import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import FoodCard from "../../components/FoodCard";
import RestaurantCard from "../../components/RestaurantCard";
import { toast } from "../../components/Toast";
import { search } from "../../services/searchApi";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const [results, setResults] = useState({ restaurants: [], foods: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) {
      setResults({ restaurants: [], foods: [] });
      setLoading(false);
      return;
    }
    setLoading(true);
    search(q)
      .then(({ data }) => setResults(data.data))
      .catch(() => toast.error("Search failed"))
      .finally(() => setLoading(false));
  }, [q]);

  const hasResults = results.restaurants.length > 0 || results.foods.length > 0;

  return (
    <div className="browse-page">
      <div className="page-header">
        <div>
          <h1>Search results</h1>
          <p>{q ? `Showing results for "${q}"` : "Type something to search"}</p>
        </div>
      </div>

      {loading ? (
        <div className="page-loading">Searching…</div>
      ) : !hasResults ? (
        <div className="empty-state">No matches found.</div>
      ) : (
        <>
          {results.restaurants.length > 0 && (
            <section className="menu-section">
              <h2>Restaurants</h2>
              <div className="restaurant-grid">
                {results.restaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            </section>
          )}
          {results.foods.length > 0 && (
            <section className="menu-section">
              <h2>Food items</h2>
              <div className="food-grid">
                {results.foods.map((f) => (
                  <FoodCard key={f.id} food={f} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
