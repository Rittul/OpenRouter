import React, { useState, useRef, useEffect, useContext } from "react";
import "../css/Sidebar.css";
import { ProfileContext } from "../context/Profilcontext";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useNavigate } from "react-router-dom";
import { createConversation } from "../utils/chatUtils";

const NAV_ITEMS = [
  { key: "keys",    label: "API Keys", icon: "🔑", path: "/apikey" },
  { key: "credits", label: "Credits",  icon: "💳", path: "/credits" },
  { key: "chat",    label: "Chat",     icon: "💬", path: "/chats" },
];






const Sidebar = ({ active = "keys", onNavigate }) => {
  const { profile, setProfile } = useContext(ProfileContext);
  const [profileOpen,   setProfileOpen]   = useState(false);
  const [chatOpen,      setChatOpen]      = useState(false);
  const [convos,        setConvos]        = useState([]);
  const [convosLoading, setConvosLoading] = useState(false);

  const profileRef = useRef(null);
  const navigate   = useNavigate();

  // fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile`, { withCredentials: true });
        setProfile(res.data.userdetails);
      } catch (err) {
        console.error("Failed to fetch profile:", err.response?.data);
      }
    };
    fetchProfile();
  }, []);

  const handleNewChat = async () => {
  try {
    const id = await createConversation();

    navigate(`/chat/${id}`);
  } catch (err) {
    console.error(err);
  }
};

  // close profile menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // fetch conversations only on first open — reuse cached state on re-opens
  useEffect(() => {
    if (!chatOpen) return;         // panel is closing, skip
    if (convos.length > 0) return; // already fetched, use cached data

    const fetchConvos = async () => {
      setConvosLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/chat/getconvo`, { withCredentials: true });
        setConvos(res.data?.conversations || res.data || []);
      } catch (err) {
        console.error("Failed to fetch conversations:", err.response?.data);
        setConvos([]);
      } finally {
        setConvosLoading(false);
      }
    };
    fetchConvos();
  }, [chatOpen]);

  const name    = profile?.name    ?? "...";
  const balance = profile?.balance ?? 0;

  const handleLogout = async () => {
    await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleNavClick = (item) => {
    if (item.key === "chat") {
      setChatOpen((prev) => !prev);
      // navigate(item.path);
    } else {
      setChatOpen(false);
      navigate(item.path);
    }
  };

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
            <span className="sidebar__credits-value">${Number(balance).toFixed(2)}</span>
          </div>
          <button
            className="sidebar__credits-add"
            onClick={() => { setChatOpen(false); navigate("/credits"); }}
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

              {/* nav row */}
              <button
                className={`sidebar__nav-item${active === item.key ? " sidebar__nav-item--active" : ""}`}
                onClick={() => handleNavClick(item)}
              >
                <span className="sidebar__nav-icon">{item.icon}</span>
                <span className="sidebar__nav-label">{item.label}</span>
                {item.key === "chat" && (
                  <span className={`sidebar__caret${chatOpen ? " sidebar__caret--open" : ""}`}>›</span>
                )}
              </button>

              {/* conversation list — only under Chat, toggles */}
              {item.key === "chat" && (
                <div className={`sidebar__convos${chatOpen ? " sidebar__convos--open" : ""}`}>
                  <div className="sidebar__convos-inner">
                    <button
                      className="sidebar__new-chat"
                      onClick={handleNewChat}
                    >
                      <span className="sidebar__new-chat-icon">＋</span>
                      New chat
                    </button>

                    {convosLoading ? (
                      <p className="sidebar__convos-empty">Loading...</p>
                    ) : convos.length === 0 ? (
                      <p className="sidebar__convos-empty">No conversations yet</p>
                    ) : (
                      <ul className="sidebar__convo-list">
                        {convos.map((c) => (
                          <li key={c.id}>
                            <button
                              className="sidebar__convo-item"
                              onClick={() => navigate(`/chat/${c.id}`)}
                              title={c.messages?.[0]?.content || "New conversation"}
                            >
                              <span className="sidebar__convo-dot" />
                              <span className="sidebar__convo-title">
                                {c.messages?.[0]?.content
                                  ? c.messages[0].content.slice(0, 36) + (c.messages[0].content.length > 36 ? "…" : "")
                                  : "New conversation"}
                              </span>
                              {c.created_at && (
                                <span className="sidebar__convo-time">
                                  {new Date(c.created_at).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

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
              onClick={() => { onNavigate?.("profile"); setProfileOpen(false); }}
            >
              <span>👤</span> Update profile
            </button>
            <button
              className="sidebar__profile-menu-item"
              onClick={() => { onNavigate?.("settings"); setProfileOpen(false); }}
            >
              <span>⚙️</span> Settings
            </button>
            <div className="sidebar__profile-menu-divider" />
            <button
              className="sidebar__profile-menu-item sidebar__profile-menu-item--danger"
              onClick={() => { handleLogout(); setProfileOpen(false); }}
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
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="sidebar__profile-info">
            <span className="sidebar__profile-name">{name}</span>
          </span>
          <span className="sidebar__profile-caret">⌃</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;