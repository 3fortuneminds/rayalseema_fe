import { useEffect, useState } from "react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import { useMyRestaurant } from "../../context/RestaurantContext";
import { getRestaurantCategories } from "../../services/restaurantApi";
import { updateMyOpeningHours, updateMyRestaurant } from "../../services/restaurantOwnerApi";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function buildHoursState(restaurant) {
  const existing = {};
  (restaurant?.opening_hours ?? []).forEach((h) => {
    existing[h.weekday] = h;
  });
  return WEEKDAYS.map((_, weekday) => ({
    weekday,
    opens_at: existing[weekday]?.opens_at?.slice(0, 5) ?? "09:00",
    closes_at: existing[weekday]?.closes_at?.slice(0, 5) ?? "21:00",
    is_closed: existing[weekday]?.is_closed ?? false,
  }));
}

export default function RestaurantProfile() {
  const { restaurant, refresh, loading } = useMyRestaurant();
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [hours, setHours] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingHours, setSavingHours] = useState(false);

  useEffect(() => {
    getRestaurantCategories()
      .then(({ data }) => setAllCategories(data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!restaurant) return;
    setForm({
      name: restaurant.name,
      description: restaurant.description ?? "",
      city: restaurant.city ?? "",
      address_line: restaurant.address_line ?? "",
      latitude: restaurant.latitude ?? "",
      longitude: restaurant.longitude ?? "",
    });
    setSelectedCategories(restaurant.categories.map((c) => c.id));
    setHours(buildHoursState(restaurant));
  }, [restaurant]);

  const toggleCategory = (id) => {
    setSelectedCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const updateHourField = (weekday, field, value) => {
    setHours((prev) => prev.map((h) => (h.weekday === weekday ? { ...h, [field]: value } : h)));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      let payload;
      if (logoFile || coverFile) {
        payload = new FormData();
        Object.entries(form).forEach(([key, value]) => payload.append(key, value ?? ""));
        selectedCategories.forEach((id) => payload.append("categories", id));
        if (logoFile) payload.append("logo", logoFile);
        if (coverFile) payload.append("cover_image", coverFile);
      } else {
        payload = { ...form, categories: selectedCategories };
      }
      await updateMyRestaurant(payload);
      toast.success("Profile updated");
      refresh();
    } catch {
      toast.error("Could not update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveHours = async (e) => {
    e.preventDefault();
    setSavingHours(true);
    try {
      await updateMyOpeningHours(hours);
      toast.success("Opening hours updated");
      refresh();
    } catch {
      toast.error("Could not update opening hours");
    } finally {
      setSavingHours(false);
    }
  };

  if (loading || !form) return <div className="page-loading">Loading…</div>;

  return (
    <div className="restaurant-profile-page">
      <div className="page-header">
        <div>
          <h1>Restaurant profile</h1>
          <p>Keep your public listing up to date</p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSaveProfile} className="auth-form">
          <Input name="name" label="Restaurant name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            name="description"
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="form-row">
            <Input name="city" label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <Input
              name="address_line"
              label="Address"
              value={form.address_line}
              onChange={(e) => setForm({ ...form, address_line: e.target.value })}
            />
          </div>
          <div className="form-row">
            <Input
              name="latitude"
              label="Latitude"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
            <Input
              name="longitude"
              label="Longitude"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Cuisine categories</label>
            <div className="category-chips">
              {allCategories.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  className={`chip${selectedCategories.includes(c.id) ? " active" : ""}`}
                  onClick={() => toggleCategory(c.id)}
                >
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="input-group">
              <label htmlFor="logo">Logo</label>
              <input id="logo" type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files[0])} />
            </div>
            <div className="input-group">
              <label htmlFor="cover">Cover image</label>
              <input id="cover" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />
            </div>
          </div>

          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? "Saving…" : "Save profile"}
          </Button>
        </form>
      </div>

      <div className="card">
        <form onSubmit={handleSaveHours}>
          <h2 className="section-title">Opening hours</h2>
          <div className="hours-editor">
            {hours.map((h) => (
              <div key={h.weekday} className="hours-editor-row">
                <span className="hours-editor-day">{WEEKDAYS[h.weekday]}</span>
                {h.is_closed ? (
                  <span className="hours-editor-closed">Closed</span>
                ) : (
                  <div className="hours-editor-times">
                    <input
                      type="time"
                      value={h.opens_at}
                      onChange={(e) => updateHourField(h.weekday, "opens_at", e.target.value)}
                    />
                    <span>–</span>
                    <input
                      type="time"
                      value={h.closes_at}
                      onChange={(e) => updateHourField(h.weekday, "closes_at", e.target.value)}
                    />
                  </div>
                )}
                <label className="hours-editor-toggle">
                  <input
                    type="checkbox"
                    checked={h.is_closed}
                    onChange={(e) => updateHourField(h.weekday, "is_closed", e.target.checked)}
                  />
                  Closed
                </label>
              </div>
            ))}
          </div>
          <Button type="submit" variant="secondary" disabled={savingHours}>
            {savingHours ? "Saving…" : "Save hours"}
          </Button>
        </form>
      </div>
    </div>
  );
}
