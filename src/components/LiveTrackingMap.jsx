import { useEffect, useRef } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export default function LiveTrackingMap({ location, destination }) {
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const partnerMarker = useRef(null);

  useEffect(() => {
    if (!API_KEY || !mapRef.current) return undefined;
    let cancelled = false;

    loadGoogleMaps().then(() => {
      if (cancelled || !mapRef.current) return;
      const center = location ?? destination ?? { lat: 15.8281, lng: 78.0373 };
      mapObj.current = new window.google.maps.Map(mapRef.current, { center, zoom: 13 });

      if (destination) {
        new window.google.maps.Marker({
          position: destination,
          map: mapObj.current,
          label: "D",
          title: "Delivery address",
        });
      }
      if (location) {
        partnerMarker.current = new window.google.maps.Marker({
          position: location,
          map: mapObj.current,
          title: "Delivery partner",
        });
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!location || !mapObj.current) return;
    if (partnerMarker.current) {
      partnerMarker.current.setPosition(location);
    } else {
      partnerMarker.current = new window.google.maps.Marker({
        position: location,
        map: mapObj.current,
        title: "Delivery partner",
      });
    }
    mapObj.current.panTo(location);
  }, [location]);

  if (!API_KEY) {
    return (
      <div className="map-picker-fallback">
        <p className="hint">
          Google Maps API key not configured.{" "}
          {location
            ? `Last known location: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`
            : "Waiting for delivery partner location…"}
        </p>
      </div>
    );
  }

  return <div ref={mapRef} className="map-picker live-tracking-map" />;
}
