import React, { useState, useRef, useEffect } from "react";
import "../css/Sidebar.css";

const NAV_ITEMS = [
  { key: "chat", label: "Chat", icon: "💬" },
  { key: "keys", label: "API Keys", icon: "🔑" },
  { key: "credits", label: "Credits", icon: "💳" },
];

const Sidebar = ({ active = "chat", onNavigate, user = {} }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const {
    name = "Dev User",
    email = "dev@example.com",
    avatarUrl = "",
    credits = 24.5,
  } = user;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <aside className="sidebar">
      {/* ── LOGO ── */}
      <div className="sidebar__logo">
        <span className="sidebar__logo-icon">◈</span>
        <span className="sidebar__logo-text">OpenRouter</span>
      </div>

      {/* ── CREDITS ── */}
      <div className="sidebar__section sidebar__credits">
        <div className="sidebar__credits-row">
          <div className="sidebar__credits-info">
            <span className="sidebar__credits-label">Balance</span>
            <span className="sidebar__credits-value">${credits.toFixed(2)}</span>
          </div>
          <button
            className="sidebar__credits-add"
            onClick={() => onNavigate?.("credits")}
            title="Add credits"
          >
            + Add
          </button>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="sidebar__nav">
        <span className="sidebar__nav-heading">Workspace</span>
        <ul className="sidebar__nav-list">
          {NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <button
                className={`sidebar__nav-item${
                  active === item.key ? " sidebar__nav-item--active" : ""
                }`}
                onClick={() => onNavigate?.(item.key)}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── PROFILE (bottom) ── */}
      <div className="sidebar__profile" ref={profileRef}>
        {profileOpen && (
          <div className="sidebar__profile-menu">
            <button
              className="sidebar__profile-menu-item"
              onClick={() => {
                onNavigate?.("profile");
                setProfileOpen(false);
              }}
            >
              <span>👤</span> Update profile
            </button>
            <button
              className="sidebar__profile-menu-item"
              onClick={() => {
                onNavigate?.("settings");
                setProfileOpen(false);
              }}
            >
              <span>⚙️</span> Settings
            </button>
            <div className="sidebar__profile-menu-divider" />
            <button
              className="sidebar__profile-menu-item sidebar__profile-menu-item--danger"
              onClick={() => {
                onNavigate?.("logout");
                setProfileOpen(false);
              }}
            >
              <span>↪</span> Log out
            </button>
          </div>
        )}

        <button
          className="sidebar__profile-trigger"
          onClick={() => setProfileOpen((p) => !p)}
        >
          <span className="sidebar__avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </span>
          <span className="sidebar__profile-info">
            <span className="sidebar__profile-name">{name}</span>
            <span className="sidebar__profile-email">{email}</span>
          </span>
          <span className="sidebar__profile-caret">⌃</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;