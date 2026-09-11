import { ChevronDown, LogOut, Menu, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../store/authSlice";

export default function PortalTopBar({ title, onMenuClick, profileTo, extra }) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const initial = (user?.full_name || user?.email || "?").trim().charAt(0).toUpperCase();
  const firstName = user?.full_name?.split(" ")[0] || user?.email;

  useEffect(() => {
    if (!profileOpen) return undefined;
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

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

      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-actions">
        {extra}

        <div className="topbar-profile" ref={profileRef}>
          <button type="button" className="topbar-profile-trigger" onClick={() => setProfileOpen((o) => !o)}>
            <span className="avatar-badge">{user?.avatar ? <img src={user.avatar} alt="" /> : initial}</span>
            <span className="topbar-profile-name">{firstName}</span>
            <ChevronDown size={14} />
          </button>
          {profileOpen && (
            <div className="topbar-profile-panel">
              {profileTo && (
                <NavLink to={profileTo} className="topbar-profile-item" onClick={() => setProfileOpen(false)}>
                  <User size={15} />
                  My Profile
                </NavLink>
              )}
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
