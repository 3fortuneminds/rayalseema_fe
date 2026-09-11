import { useEffect, useRef, useState } from "react";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTER = { lat: 15.8281, lng: 78.0373 }; // Rayalseema region

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

export default function MapPicker({ latitude, longitude, onChange }) {
  const mapRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!API_KEY) return;
    loadGoogleMaps()
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const center = latitude && longitude ? { lat: latitude, lng: longitude } : DEFAULT_CENTER;
    const map = new window.google.maps.Map(mapRef.current, { center, zoom: 13 });
    const marker = new window.google.maps.Marker({ position: center, map, draggable: true });

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      onChange({ latitude: pos.lat(), longitude: pos.lng() });
    });
    map.addListener("click", (e) => {
      marker.setPosition(e.latLng);
      onChange({ latitude: e.latLng.lat(), longitude: e.latLng.lng() });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  if (!API_KEY) {
    return (
      <div className="map-picker-fallback">
        <p className="hint">Google Maps API key not configured — enter coordinates manually.</p>
        <div className="latlng-inputs">
          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={latitude ?? ""}
            onChange={(e) => onChange({ latitude: parseFloat(e.target.value) || null, longitude })}
          />
          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={longitude ?? ""}
            onChange={(e) => onChange({ latitude, longitude: parseFloat(e.target.value) || null })}
          />
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="map-picker" />;
}
