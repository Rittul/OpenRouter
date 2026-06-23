import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import "../css/Apikey.css";

const Apikey = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState("");

  const [visible, setVisible] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);
  const copyTimeoutRef = useRef(null);

  const fetchKeys = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/getapikeys`, { withCredentials: true });
      setKeys(res.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
    return () => clearTimeout(copyTimeoutRef.current);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreateError("");
    try {
      await axios.post(`${BASE_URL}/api-key/create`, { name: newName }, { withCredentials: true });
      fetchKeys();
      setNewName("");
      setShowCreate(false);
    } catch (err) {
      setCreateError(err.response?.data?.message || err.message || "Failed to create key");
    }
  };

  const toggleStatus = async (key) => {
    const status = !key.disabled;
    const id = key.id;

    try {
      await axios.post(`${BASE_URL}/api-key/${id}/${status}`, {}, { withCredentials: true });
      fetchKeys();
    } catch (err) {
      console.log(err.message);
    }
  };

  const toggleVisible = (name) => {
    setVisible((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const copyToClipboard = (text, name) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(name);
    clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopiedKey(null), 1800);
  };

  const maskKey = (key) => `${key.slice(0, 10)}...${key.slice(-4)}`;

  return (
    <div className="apikey">
      <div className="apikey__header">
        <div>
          <h2 className="apikey__title">API Keys</h2>
          <p className="apikey__subtitle">
            Manage keys used to authenticate requests to the OpenRouter API.
          </p>
        </div>
        <button className="apikey__create-btn" onClick={() => setShowCreate(true)}>
          + Create key
        </button>
      </div>

      {error && <p className="apikey__error">{error}</p>}

      {/* ── table ── */}
      <div className="apikey__table">
        <div className="apikey__row apikey__row--head">
          <span>Name</span>
          <span>Key</span>
          <span>Status</span>
          <span></span>
        </div>

        {loading ? (
          <div className="apikey__empty">Loading keys...</div>
        ) : keys.length === 0 ? (
          <div className="apikey__empty">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          keys.map((k) => {
            const isVisible = visible[k.name];
            const isCopied = copiedKey === k.name;
            return (
              <div className="apikey__row" key={k.name}>
                <span className="apikey__name">{k.name}</span>

                <span className="apikey__value-wrap">
                  <span className="apikey__value-scroll">
                    <code className={`apikey__value${isVisible ? " apikey__value--full" : ""}`}>
                      {isVisible ? k.key_hash : maskKey(k.key_hash)}
                    </code>
                  </span>
                  <button
                    className="apikey__icon-btn"
                    onClick={() => toggleVisible(k.name)}
                    title={isVisible ? "Hide" : "Reveal"}
                  >
                    {isVisible ? "Hide" : "Show"}
                  </button>
                  <button
                    className={`apikey__icon-btn apikey__copy-btn${
                      isCopied ? " apikey__copy-btn--copied" : ""
                    }`}
                    onClick={() => copyToClipboard(k.key_hash, k.name)}
                    title="Copy"
                  >
                    {isCopied ? "✓ Copied" : "Copy"}
                  </button>
                </span>

                <span>
                  <span
                    className={`apikey__badge apikey__badge--${
                      k.disabled ? "disabled" : "enabled"
                    }`}
                  >
                    <span className="apikey__badge-dot" />
                    {k.disabled ? "Disabled" : "Enabled"}
                  </span>
                </span>

                <span className="apikey__actions">
                  <label className="apikey__switch">
                    <input
                      type="checkbox"
                      checked={!k.disabled}
                      onChange={() => toggleStatus(k)}
                    />
                    <span className="apikey__switch-slider" />
                  </label>
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── create modal ── */}
      {showCreate && (
        <div
          className="apikey-overlay"
          onClick={() => {
            setShowCreate(false);
            setCreateError("");
            setNewName("");
          }}
        >
          <div className="apikey-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="apikey-modal__close"
              onClick={() => {
                setShowCreate(false);
                setCreateError("");
                setNewName("");
              }}
            >
              ✕
            </button>
            <h3 className="apikey-modal__title">Create new API key</h3>
            <p className="apikey-modal__subtitle">
              Give your key a name to help you identify it later.
            </p>
            <h3 className="apikey-modal__label">Key name</h3>
            <input
              type="text"
              placeholder="e.g. Production"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setCreateError("");
              }}
              autoFocus
            />
            {createError && (
              <p className="apikey__error" style={{ marginTop: "8px" }}>
                {createError}
              </p>
            )}
            <button
              className="apikey-modal__submit"
              onClick={handleCreate}
              disabled={!newName.trim()}
            >
              Create key
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Apikey;