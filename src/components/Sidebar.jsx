import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

import BrandMark from "./BrandMark";

const navLinkClass = ({ isActive }) => `sidebar-link${isActive ? " active" : ""}`;

export default function Sidebar({
  open,
  onClose,
  navItems,
  brandTo = "/",
  brandLabel = "Rayalseema",
  brandTagline = "Food Delivery",
  promo,
  profileTo,
}) {
  const user = useSelector((state) => state.auth.user);
  const initial = (user?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();

  return (
    <>
      <aside className={`sidebar${open ? " open" : ""}`}>
        <NavLink to={brandTo} className="sidebar-brand" onClick={onClose}>
          <span className="sidebar-brand-mark">
            <BrandMark size={26} />
          </span>
          <span>
            <span className="sidebar-brand-name">{brandLabel}</span>
            <span className="sidebar-brand-tagline">{brandTagline}</span>
          </span>
        </NavLink>

        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={onClose}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {promo}

        {user && profileTo && (
          <NavLink to={profileTo} className="sidebar-profile" onClick={onClose}>
            <span className="avatar-badge">{user.avatar ? <img src={user.avatar} alt="" /> : initial}</span>
            <span className="sidebar-profile-text">
              <strong>{user.full_name || user.email}</strong>
              <span>View profile</span>
            </span>
            <ChevronRight size={15} />
          </NavLink>
        )}
        {user && !profileTo && (
          <div className="sidebar-profile">
            <span className="avatar-badge">{user.avatar ? <img src={user.avatar} alt="" /> : initial}</span>
            <span className="sidebar-profile-text">
              <strong>{user.full_name || user.email}</strong>
              <span>{user.role}</span>
            </span>
          </div>
        )}
      </aside>
      <button
        type="button"
        className={`nav-scrim${open ? " open" : ""}`}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
    </>
  );
}
