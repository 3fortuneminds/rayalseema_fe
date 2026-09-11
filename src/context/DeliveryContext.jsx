import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { getMyDeliveryPartner } from "../services/deliveryApi";

const DeliveryContext = createContext(null);

export function DeliveryProvider({ children }) {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    return getMyDeliveryPartner()
      .then(({ data }) => setPartner(data.data))
      .catch(() => setPartner(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DeliveryContext.Provider value={{ partner, loading, refresh, setPartner }}>{children}</DeliveryContext.Provider>
  );
}

export function useMyDeliveryPartner() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error("useMyDeliveryPartner must be used within a DeliveryProvider");
  return ctx;
}
