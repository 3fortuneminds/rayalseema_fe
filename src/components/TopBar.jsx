import { ChevronDown, LogOut, Menu, MapPin, Search, ShoppingCart, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";

import { listAddresses } from "../services/addressApi";
import { logout } from "../store/authSlice";
import NotificationBell from "./NotificationBell";

export default function TopBar({ onMenuClick }) {
  const user = useSelector((state) => state.auth.user);
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [deliverTo, setDeliverTo] = useState("Add an address");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const searchInputRef = useRef(null);
  const profileRef = useRef(null);

  const initial = (user?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();
  const firstName = user?.full_name?.split(" ")[0] || user?.email;

  useEffect(() => {
    listAddresses()
      .then(({ data }) => {
        const addresses = data.data;
        const primary = addresses.find((a) => a.is_default) || addresses[0];
        if (primary) setDeliverTo(`${primary.city}, Andhra Pradesh`);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
      setQuery("");
    }
  };

  const handleLogout = () => {
    setProfileOpen(false);
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="topbar">
      <button type="button" className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={18} />
      </button>

      <Link to="/addresses" className="topbar-deliver-to">
        <MapPin size={16} />
        <span className="topbar-deliver-to-text">
          <small>Deliver to</small>
          <strong>{deliverTo}</strong>
        </span>
        <ChevronDown size={14} />
      </Link>

      <div className="topbar-actions">
        <form className={`topbar-search${searchOpen ? " open" : ""}`} onSubmit={handleSearchSubmit}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Search"
          >
            <Search size={16} />
          </button>
          <input
            ref={searchInputRef}
            placeholder="Search restaurants, cuisines or dishes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => !query && setSearchOpen(false)}
          />
        </form>

        <NotificationBell />

        <NavLink to="/cart" className="icon-btn cart-btn" title="Cart">
          <ShoppingCart size={16} />
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </NavLink>

        <div className="topbar-profile" ref={profileRef}>
          <button type="button" className="topbar-profile-trigger" onClick={() => setProfileOpen((o) => !o)}>
            <span className="avatar-badge">{user?.avatar ? <img src={user.avatar} alt="" /> : initial}</span>
            <span className="topbar-profile-name">{firstName}</span>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <div className="topbar-profile-panel">
              <NavLink to="/profile" className="topbar-profile-item" onClick={() => setProfileOpen(false)}>
                <User size={15} />
                My Profile
              </NavLink>
              <button type="button" className="topbar-profile-item" onClick={handleLogout}>
                <LogOut size={15} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
