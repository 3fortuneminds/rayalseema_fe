import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notificationApi";
import { createSocket } from "../services/websocket";

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    listNotifications()
      .then(({ data }) => setNotifications(data.data))
      .catch(() => {});
    getUnreadNotificationCount()
      .then(({ data }) => setUnreadCount(data.data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const socket = createSocket("/notifications/", {
      onMessage: (msg) => {
        if (msg.type === "notification.new") {
          setNotifications((prev) => [msg, ...prev].slice(0, 30));
          setUnreadCount((c) => c + 1);
        }
      },
    });
    return () => socket.close();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleOpenNotification = async (n) => {
    if (!n.is_read) {
      try {
        await markNotificationRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {
        // best-effort — dropdown UX still works even if this fails
      }
    }
    setOpen(false);
    if (n.related_order) navigate(`/orders/${n.related_order}`);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {
      // best-effort
    }
  };

  return (
    <div className="notification-bell" ref={containerRef}>
      <button type="button" className="icon-btn" onClick={() => setOpen((o) => !o)} title="Notifications">
        <Bell size={16} />
        {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notification-panel">
          <div className="notification-panel-header">
            <h4>Notifications</h4>
            {unreadCount > 0 && (
              <button type="button" className="link-inline notification-mark-all" onClick={handleMarkAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="notification-empty">No notifications yet.</p>
          ) : (
            <ul className="notification-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notification-item${n.is_read ? "" : " unread"}`}
                  onClick={() => handleOpenNotification(n)}
                >
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                  <span className="notification-time">{timeAgo(n.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
