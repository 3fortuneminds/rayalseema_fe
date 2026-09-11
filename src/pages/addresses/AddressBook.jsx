import { MapPinPlus, Pencil, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import MapPicker from "../../components/MapPicker";
import { toast } from "../../components/Toast";
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setDefaultAddress,
  updateAddress,
} from "../../services/addressApi";

const EMPTY_FORM = {
  label: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  latitude: null,
  longitude: null,
};

export default function AddressBook() {
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  const refresh = () =>
    listAddresses()
      .then(({ data }) => setAddresses(data.data))
      .catch(() => toast.error("Could not load addresses"));

  useEffect(() => {
    refresh();
  }, []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const startEdit = (address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      latitude: address.latitude ? Number(address.latitude) : null,
      longitude: address.longitude ? Number(address.longitude) : null,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAddress(editingId, form);
        toast.success("Address updated");
      } else {
        await createAddress(form);
        toast.success("Address added");
      }
      setShowForm(false);
      refresh();
    } catch {
      toast.error("Could not save address");
    }
  };

  const handleDelete = async (id) => {
    await deleteAddress(id);
    toast.success("Address removed");
    refresh();
  };

  const handleSetDefault = async (id) => {
    await setDefaultAddress(id);
    refresh();
  };

  return (
    <div className="address-book">
      <div className="page-header">
        <div>
          <h1>Address book</h1>
          <p>Where should we deliver your order?</p>
        </div>
        {!showForm && (
          <Button onClick={startCreate}>
            <MapPinPlus size={16} />
            Add address
          </Button>
        )}
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="empty-state">No addresses yet — add one to get started.</div>
      )}

      <ul className="address-list">
        {addresses.map((a) => (
          <li key={a.id} className="address-card">
            <div>
              <div className="address-card-label">
                {a.label || "Address"}
                {a.is_default && <span className="badge">Default</span>}
              </div>
              <p>
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.state} {a.postal_code}
              </p>
            </div>
            <div className="address-actions">
              {!a.is_default && (
                <button type="button" className="icon-btn" title="Set as default" onClick={() => handleSetDefault(a.id)}>
                  <Star size={15} />
                </button>
              )}
              <button type="button" className="icon-btn" title="Edit" onClick={() => startEdit(a)}>
                <Pencil size={15} />
              </button>
              <button type="button" className="icon-btn" title="Delete" onClick={() => handleDelete(a.id)}>
                <Trash2 size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>{editingId ? "Edit address" : "New address"}</h2>
            <Input name="label" label="Label (Home, Work…)" value={form.label} onChange={update("label")} />
            <Input name="line1" label="Address line 1" value={form.line1} onChange={update("line1")} />
            <Input name="line2" label="Address line 2" value={form.line2} onChange={update("line2")} />
            <div className="form-row">
              <Input name="city" label="City" value={form.city} onChange={update("city")} />
              <Input name="state" label="State" value={form.state} onChange={update("state")} />
            </div>
            <Input name="postal_code" label="Postal code" value={form.postal_code} onChange={update("postal_code")} />
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={({ latitude, longitude }) => setForm((f) => ({ ...f, latitude, longitude }))}
            />
            <div className="address-actions">
              <Button type="submit">{editingId ? "Save" : "Add"}</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
