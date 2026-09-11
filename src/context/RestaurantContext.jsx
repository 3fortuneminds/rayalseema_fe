import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getMyRestaurant } from "../services/restaurantOwnerApi";

const RestaurantContext = createContext(null);

export function RestaurantProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return getMyRestaurant()
      .then(({ data }) => setRestaurant(data.data))
      .catch(() => setRestaurant(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, refresh, setRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useMyRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useMyRestaurant must be used within a RestaurantProvider");
  return ctx;
}
