import { MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "../../components/Toast";
import { useMyDeliveryPartner } from "../../context/DeliveryContext";
import { acceptDelivery, listAvailableOrders } from "../../services/deliveryApi";

export default function AvailableOrders() {
  const { partner } = useMyDeliveryPartner();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [accepting, setAccepting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, []);

  const refresh = () => {
    setLoading(true);
    const params = coords ? { lat: coords.lat, lng: coords.lng } : undefined;
    listAvailableOrders(params)
      .then(({ data }) => setOrders(data.data))
      .catch(() => toast.error("Could not load available orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  const handleAccept = async (orderId) => {
    setAccepting(orderId);
    try {
      const { data } = await acceptDelivery(orderId);
      toast.success("Delivery accepted");
      navigate(`/delivery/my-deliveries/${data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not accept delivery");
      refresh();
    } finally {
      setAccepting(null);
    }
  };

  if (!partner?.is_approved) {
    return (
      <div className="empty-state">Your account is pending approval. You'll see available orders once approved.</div>
    );
  }

  if (!partner.is_online) {
    return <div className="empty-state">You're offline. Go online to see available orders.</div>;
  }

  return (
    <div className="available-orders-page">
      <div className="page-header">
        <div>
          <h1>Available orders</h1>
          <p>{coords ? "Sorted by distance from your location" : "Enable location to sort by distance"}</p>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={refresh}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="page-loading">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">No orders available right now. Check back soon.</div>
      ) : (
        <div className="order-queue-list">
          {orders.map((o) => (
            <div key={o.id} className="order-queue-card">
              <div className="order-queue-header">
                <div className="order-queue-header-main">
                  {o.restaurant_cover_image ? (
                    <img className="order-thumb" src={o.restaurant_cover_image} alt="" />
                  ) : (
                    <span className="order-thumb order-thumb-fallback">🍽️</span>
                  )}
                  <div>
                    <strong>{o.restaurant_name}</strong>
                    <p>
                      <MapPin size={14} /> {o.restaurant_city}
                      {o.distance_km != null && (
                        <>
                          {" "}
                          · <Navigation size={14} /> {o.distance_km} km
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <span className="badge">₹{Number(o.total_amount).toFixed(0)}</span>
              </div>
              <div className="order-queue-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={accepting === o.id}
                  onClick={() => handleAccept(o.id)}
                >
                  {accepting === o.id ? "Accepting…" : "Accept delivery"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
