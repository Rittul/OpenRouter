import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useParams, useNavigate } from "react-router-dom";
import "../css/Chat.css";

const Chat = () => {
  const { id: convoIdFromUrl } = useParams(); // from /chat/:id
  const navigate = useNavigate();

  const [models, setModels]           = useState([]);
  const [selectedModel, setSelectedModel] = useState(null); // { name, slug }
  const [modelOpen, setModelOpen]     = useState(false);

  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [convoId, setConvoId]         = useState(convoIdFromUrl ? Number(convoIdFromUrl) : null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [unsupported, setUnsupported] = useState("");

  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const modelRef    = useRef(null);

  // ── fetch models on mount ──
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/models`, { withCredentials: true });
        const list = res.data?.models || res.data || [];
        setModels(list);
        if (list.length > 0) setSelectedModel(list[0]);
      } catch (err) {
        console.error("Failed to fetch models:", err);
      }
    };
    fetchModels();
  }, []);

  // ── load previous messages if convoId in URL ──
  useEffect(() => {
    if (!convoIdFromUrl) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/chat/getmessages/${convoIdFromUrl}`, {
          withCredentials: true,
        });
        const msgs = res.data?.messages || res.data || [];
        setMessages(
          msgs.map((m) => ({
            role: m.role,         // "user" | "assistant"
            content: m.content,
            id: m.id,
          }))
        );
        setConvoId(Number(convoIdFromUrl));
      } catch (err) {
        setError("Failed to load conversation.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [convoIdFromUrl]);

  // ── close model dropdown on outside click ──
  useEffect(() => {
    const handler = (e) => {
      if (modelRef.current && !modelRef.current.contains(e.target)) {
        setModelOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── scroll to bottom on new messages ──
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!selectedModel) { setError("Please select a model first."); return; }

    setUnsupported("");
    setError("");

    // optimistically add user message
    const userMsg = { role: "user", content: text, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setLoading(true);
    try {
        // console.log("convoId:", convoId);
      const body = {
        content: text,
        slug: selectedModel.slug,
        ...(convoId ? { conversationId: convoId } : {}),
      };

      const res = await axios.post(`${BASE_URL}/chat/completion`, body, {
        withCredentials: true,
      });

      const data = res.data;

      // backend returns unsupported message
      if (data?.messages && !data?.content && !data?.reply && !data?.response) {
        setUnsupported(data.messages);
        // remove the optimistic user message since nothing was saved
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        return;
      }

      // set convoId from response if new conversation
      if (data?.conversationId && !convoId) {
        setConvoId(data.conversationId);
        navigate(`/chat/${data.conversationId}`, { replace: true });
      }

      const aiContent =
        data?.content || data?.reply || data?.response ||
        data?.message || JSON.stringify(data);

      const aiMsg = {
        role: "assistant",
        content: aiContent,
        id: Date.now() + 1,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.messages || "Something went wrong.";
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async () => {
    if (!convoId) return;
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await axios.delete(`${BASE_URL}/deleteconvo/${convoId}`, { withCredentials: true });
      navigate("/chat");
      setMessages([]);
      setConvoId(null);
    } catch (err) {
      setError("Failed to delete conversation.");
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setConvoId(null);
    setError("");
    setUnsupported("");
    navigate("/chat");
    inputRef.current?.focus();
  };

  return (
    <div className="chat">
      {/* ── TOP BAR ── */}
      <div className="chat__topbar">
        <div className="chat__topbar-left">
          {/* model selector */}
          <div className="chat__model-select" ref={modelRef}>
            <button
              className="chat__model-btn"
              onClick={() => setModelOpen((p) => !p)}
            >
              <span className="chat__model-dot" />
              <span>{selectedModel ? selectedModel.name : "Select model"}</span>
              <span className={`chat__model-caret${modelOpen ? " chat__model-caret--open" : ""}`}>›</span>
            </button>
            {modelOpen && (
              <div className="chat__model-dropdown">
                {models.length === 0 ? (
                  <p className="chat__model-empty">No models available</p>
                ) : (
                  models.map((m) => (
                    <button
                      key={m.slug}
                      className={`chat__model-option${
                        selectedModel?.slug === m.slug ? " chat__model-option--active" : ""
                      }`}
                      onClick={() => { setSelectedModel(m); setModelOpen(false); }}
                    >
                      <span className="chat__model-option-name">{m.name}</span>
                      <span className="chat__model-option-slug">{m.slug}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="chat__topbar-right">
          <button className="chat__topbar-btn" onClick={startNewChat} title="New chat">
            ✎ New chat
          </button>
          {convoId && (
            <button
              className="chat__topbar-btn chat__topbar-btn--danger"
              onClick={handleDelete}
              title="Delete conversation"
            >
              🗑 Delete
            </button>
          )}
        </div>
      </div>

      {/* ── MESSAGES ── */}
      <div className="chat__messages">
        {messages.length === 0 && !loading && (
          <div className="chat__empty">
            <span className="chat__empty-icon">◈</span>
            <p className="chat__empty-title">Start a conversation</p>
            <p className="chat__empty-sub">
              Select a model above and send a message.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`chat__msg chat__msg--${msg.role}`}
          >
            <span className="chat__msg-avatar">
              {msg.role === "user" ? "U" : "AI"}
            </span>
            <div className="chat__msg-bubble">
              <span className="chat__msg-role">
                {msg.role === "user" ? "You" : selectedModel?.name || "Assistant"}
              </span>
              <p className="chat__msg-content">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* AI thinking indicator */}
        {loading && (
          <div className="chat__msg chat__msg--assistant">
            <span className="chat__msg-avatar">AI</span>
            <div className="chat__msg-bubble">
              <span className="chat__msg-role">{selectedModel?.name || "Assistant"}</span>
              <div className="chat__typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        {/* unsupported model message */}
        {unsupported && (
          <div className="chat__unsupported">
            ⚠ {unsupported}
          </div>
        )}

        {/* error */}
        {error && (
          <div className="chat__error">{error}</div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div className="chat__input-wrap">
        <textarea
          ref={inputRef}
          className="chat__input"
          placeholder={`Message ${selectedModel?.name || "AI"}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={loading}
        />
        <button
          className="chat__send-btn"
          onClick={handleSend}
          disabled={!input.trim() || loading}
          title="Send (Enter)"
        >
          ↑
        </button>
      </div>
      <p className="chat__input-hint">Enter to send · Shift+Enter for new line</p>
    </div>
  );
};

export default Chat;