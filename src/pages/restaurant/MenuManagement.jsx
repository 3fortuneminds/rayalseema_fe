import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import Button from "../../components/Button";
import Input from "../../components/Input";
import { toast } from "../../components/Toast";
import { useMyRestaurant } from "../../context/RestaurantContext";
import {
  createFood,
  createMyCategory,
  createVariant,
  deleteFood,
  deleteMyCategory,
  deleteVariant,
  listMyCategories,
  listMyFoods,
  toggleFoodAvailability,
  updateFood,
  updateMyCategory,
} from "../../services/menuApi";

const EMPTY_FOOD_FORM = {
  category: "",
  name: "",
  description: "",
  base_price: "",
  is_vegetarian: true,
};

function VariantEditor({ food, onChanged }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !price) return;
    try {
      await createVariant({ food: food.id, name, price, is_default: food.variants.length === 0 });
      setName("");
      setPrice("");
      onChanged();
    } catch {
      toast.error("Could not add variant");
    }
  };

  const handleDelete = async (variantId) => {
    try {
      await deleteVariant(variantId);
      onChanged();
    } catch {
      toast.error("Could not delete variant");
    }
  };

  return (
    <div className="variant-editor">
      <button type="button" className="link-inline variant-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? "Hide variants" : `Variants (${food.variants.length})`}
      </button>
      {open && (
        <div className="variant-editor-body">
          {food.variants.map((v) => (
            <div key={v.id} className="variant-row">
              <span>
                {v.name} — ₹{Number(v.price).toFixed(0)}
              </span>
              <button type="button" className="icon-btn" onClick={() => handleDelete(v.id)}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <form className="variant-add-row" onSubmit={handleAdd}>
            <input placeholder="Name (e.g. Full)" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Button type="submit" variant="secondary" className="btn-sm">
              Add
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function MenuManagement() {
  const { restaurant } = useMyRestaurant();
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [foodForm, setFoodForm] = useState(EMPTY_FOOD_FORM);
  const [foodImageFile, setFoodImageFile] = useState(null);

  const refreshCategories = () => {
    if (!restaurant) return;
    listMyCategories(restaurant.slug)
      .then(({ data }) => setCategories(data.data))
      .catch(() => {});
  };

  const refreshFoods = () => {
    listMyFoods()
      .then(({ data }) => setFoods(data.data))
      .catch(() => toast.error("Could not load menu"));
  };

  useEffect(() => {
    refreshCategories();
    refreshFoods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant?.id]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await createMyCategory({ name: newCategoryName.trim(), display_order: categories.length });
      setNewCategoryName("");
      refreshCategories();
    } catch {
      toast.error("Could not add category");
    }
  };

  const handleRenameCategory = async (id) => {
    try {
      await updateMyCategory(id, { name: editingCategoryName });
      setEditingCategoryId(null);
      refreshCategories();
    } catch {
      toast.error("Could not rename category");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteMyCategory(id);
      refreshCategories();
      refreshFoods();
    } catch {
      toast.error("Could not delete category — remove its items first");
    }
  };

  const startCreateFood = () => {
    setEditingFoodId(null);
    setFoodForm(EMPTY_FOOD_FORM);
    setFoodImageFile(null);
    setShowFoodForm(true);
  };

  const startEditFood = (food) => {
    setEditingFoodId(food.id);
    setFoodForm({
      category: food.category ?? "",
      name: food.name,
      description: food.description ?? "",
      base_price: food.base_price,
      is_vegetarian: food.is_vegetarian,
    });
    setFoodImageFile(null);
    setShowFoodForm(true);
  };

  const handleSaveFood = async (e) => {
    e.preventDefault();
    try {
      let payload;
      if (foodImageFile) {
        payload = new FormData();
        Object.entries(foodForm).forEach(([key, value]) => payload.append(key, value));
        payload.append("image", foodImageFile);
      } else {
        payload = foodForm;
      }
      if (editingFoodId) {
        await updateFood(editingFoodId, payload);
        toast.success("Item updated");
      } else {
        await createFood(payload);
        toast.success("Item added");
      }
      setShowFoodForm(false);
      refreshFoods();
    } catch {
      toast.error("Could not save item");
    }
  };

  const handleDeleteFood = async (id) => {
    try {
      await deleteFood(id);
      toast.success("Item removed");
      refreshFoods();
    } catch {
      toast.error("Could not delete item");
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await toggleFoodAvailability(id);
      refreshFoods();
    } catch {
      toast.error("Could not update availability");
    }
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? "Uncategorized";
  const foodsByCategory = foods.reduce((groups, f) => {
    const key = f.category ?? "none";
    groups[key] = groups[key] || [];
    groups[key].push(f);
    return groups;
  }, {});

  return (
    <div className="menu-management-page">
      <div className="page-header">
        <div>
          <h1>Menu</h1>
          <p>Manage your categories and food items</p>
        </div>
        {!showFoodForm && (
          <Button onClick={startCreateFood}>
            <Plus size={16} /> Add item
          </Button>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Categories</h2>
        <div className="category-manage-list">
          {categories.map((c) => (
            <div key={c.id} className="category-manage-row">
              {editingCategoryId === c.id ? (
                <>
                  <input
                    className="inline-edit-input"
                    value={editingCategoryName}
                    onChange={(e) => setEditingCategoryName(e.target.value)}
                  />
                  <Button variant="secondary" className="btn-sm" onClick={() => handleRenameCategory(c.id)}>
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <span>{c.name}</span>
                  <div className="address-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => {
                        setEditingCategoryId(c.id);
                        setEditingCategoryName(c.name);
                      }}
                    >
                      <Pencil size={13} />
                    </button>
                    <button type="button" className="icon-btn" onClick={() => handleDeleteCategory(c.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        <form className="variant-add-row" onSubmit={handleAddCategory}>
          <input
            placeholder="New category name (e.g. Starters)"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <Button type="submit" variant="secondary" className="btn-sm">
            Add category
          </Button>
        </form>
      </div>

      {showFoodForm && (
        <div className="card">
          <form onSubmit={handleSaveFood} className="auth-form">
            <h2 className="section-title">{editingFoodId ? "Edit item" : "New item"}</h2>
            <Input name="name" label="Name" value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} />
            <Input
              name="description"
              label="Description"
              value={foodForm.description}
              onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })}
            />
            <div className="form-row">
              <Input
                name="base_price"
                label="Base price (₹)"
                value={foodForm.base_price}
                onChange={(e) => setFoodForm({ ...foodForm, base_price: e.target.value })}
              />
              <div className="input-group">
                <label htmlFor="food-category">Category</label>
                <select
                  id="food-category"
                  value={foodForm.category}
                  onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })}
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="hours-editor-toggle">
              <input
                type="checkbox"
                checked={foodForm.is_vegetarian}
                onChange={(e) => setFoodForm({ ...foodForm, is_vegetarian: e.target.checked })}
              />
              Vegetarian
            </label>
            <div className="input-group">
              <label htmlFor="food-image">Image</label>
              <input id="food-image" type="file" accept="image/*" onChange={(e) => setFoodImageFile(e.target.files[0])} />
            </div>
            <div className="address-actions">
              <Button type="submit">{editingFoodId ? "Save" : "Add"}</Button>
              <Button variant="secondary" onClick={() => setShowFoodForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {Object.entries(foodsByCategory).map(([catId, items]) => (
        <div key={catId} className="card">
          <h2 className="section-title">{catId === "none" ? "Uncategorized" : categoryName(catId)}</h2>
          <div className="menu-manage-list">
            {items.map((food) => (
              <div key={food.id} className="menu-manage-row">
                <div className="menu-manage-info">
                  <div className="address-card-label">
                    {food.name}
                    {!food.is_available && <span className="badge status-cancelled">Unavailable</span>}
                  </div>
                  <p>₹{Number(food.base_price).toFixed(0)}</p>
                  <VariantEditor food={food} onChanged={refreshFoods} />
                </div>
                <div className="address-actions">
                  <Button variant="secondary" className="btn-sm" onClick={() => handleToggleAvailability(food.id)}>
                    {food.is_available ? "Mark unavailable" : "Mark available"}
                  </Button>
                  <button type="button" className="icon-btn" onClick={() => startEditFood(food)}>
                    <Pencil size={14} />
                  </button>
                  <button type="button" className="icon-btn" onClick={() => handleDeleteFood(food.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {foods.length === 0 && <div className="empty-state">No menu items yet — add your first one above.</div>}
    </div>
  );
}
