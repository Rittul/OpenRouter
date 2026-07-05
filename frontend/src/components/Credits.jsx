import React, { useContext, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ProfileContext } from "../context/Profilcontext";
import "../css/Credits.css";
import axios from "axios";
import { BASE_URL } from "../utils/constants";

const QUICK_AMOUNTS = [100, 250, 500, 1000];

const Credits = () => {
  const { profile, setProfile } = useContext(ProfileContext);
  const [selected, setSelected] = useState(100);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [verificationState, setVerificationState] = useState("idle"); // idle, verifying, success, error
  const [errorMessage, setErrorMessage] = useState("");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [sessionId]);

  const verifyPayment = async (id) => {
    setVerificationState("verifying");
    try {
      const res = await axios.post(
        `${BASE_URL}/verify`,
        { session_id: id },
        { withCredentials: true }
      );
      
      setProfile(prev => ({
        ...prev,
        balance: res.data.balance
      }));
      setVerificationState("success");
    } catch (err) {
      setVerificationState("error");
      setErrorMessage(
        err.response?.data?.message || "Failed to verify your Stripe payment."
      );
    }
  };

  const handleAddCredit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/order`,
        { amount: selected*83 },
        { withCredentials: true }
      );
      if (res.data?.url) {
        // Redirect to Stripe Checkout page
        window.location.href = res.data.url;
      } else {
        alert("Failed to initiate Stripe checkout. No redirect URL received.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start checkout process.");
    } finally {
      setLoading(false);
    }
  };

  const handleBypassCheckout = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/add-credits`,
        { amount: selected*83 },
        { withCredentials: true }
      );
      setProfile(prev => ({
        ...prev,
        balance: res.data.balance
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to bypass checkout.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearStatus = () => {
    setVerificationState("idle");
    setSearchParams({}); // Remove session_id from URL query params
  };

  if (verificationState === "verifying") {
    return (
      <div className="credits">
        <div className="credits__status-view">
          <div className="credits__spinner"></div>
          <h4>Verifying Payment</h4>
          <p>Please wait while we verify your transaction with Stripe.</p>
        </div>
      </div>
    );
  }

  if (verificationState === "success") {
    return (
      <div className="credits">
        <div className="credits__status-view">
          <div className="credits__success-icon">✓</div>
          <h4>Payment Successful!</h4>
          <p>Your balance has been updated successfully.</p>
          <button 
            className="credits__pay-submit-btn" 
            style={{ marginTop: "1.5rem", maxWidth: "200px" }} 
            onClick={handleClearStatus}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (verificationState === "error") {
    return (
      <div className="credits">
        <div className="credits__status-view">
          <div className="credits__error-icon">✗</div>
          <h4>Payment Failed</h4>
          <p>{errorMessage}</p>
          <button 
            className="credits__pay-submit-btn" 
            style={{ marginTop: "1.5rem", maxWidth: "200px" }} 
            onClick={handleClearStatus}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="credits">
      <div className="credits__header">
        <h2 className="credits__title">Credits</h2>
        <p className="credits__subtitle">
          Manage your balance and top up to keep using OpenRouter models.
        </p>
      </div>

      {/* ── BALANCE CARD ── */}
      <div className="credits__balance-card">
        <span className="credits__balance-label">CURRENT BALANCE</span>
        <span className="credits__balance-value">
          ${Number(profile?.balance ?? 0).toFixed(2)}
        </span>
        <span className="credits__balance-note">
          Used across all API requests and models
        </span>
      </div>

      {/* ── ADD TOKENS CARD ── */}
      <div className="credits__add-card">
        <h3 className="credits__add-title">Add tokens</h3>
        <p className="credits__add-subtitle">
          Choose an amount to add to your balance.
        </p>

        <div className="credits__amounts">
          {QUICK_AMOUNTS.map((amt) => (
            <button
              key={amt}
              className={`credits__amount${
                selected === amt ? " credits__amount--active" : ""
              }`}
              onClick={() => setSelected(amt)}
            >
              ${amt}
            </button>
          ))}
        </div>

        {/* ── PAYMENT SUMMARY ── */}
        <div style={{
          background: "#161616",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem"
        }}>
          <h4 style={{
            margin: 0,
            fontSize: "0.85rem",
            fontWeight: "600",
            color: "var(--text-1)",
            textAlign: "left"
          }}>Payment Summary</h4>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-2)" }}>Payable Amount:</span>
            <span style={{ fontSize: "1.1rem", fontWeight: "700", color: "#22c55e" }}>
              ₹{Number(selected * 83).toLocaleString()}
            </span>
          </div>

          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "-0.25rem"
          }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text-3)", fontFamily: "var(--mono)" }}>
              1 USD = ₹83 INR
            </span>
          </div>

          <div style={{
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            paddingTop: "0.75rem",
            textAlign: "center"
          }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>
              ${selected} dollars will add {Number(selected * 267).toLocaleString()} tokens
            </span>
          </div>
        </div>

        {/* ── PAY WITH STRIPE BUTTON ── */}
        <button
          className="credits__add-btn"
          style={{
            background: "#1354F8",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: "0.92rem",
            padding: "0.9rem 1rem",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(19, 84, 248, 0.25)"
          }}
          onClick={handleAddCredit}
          disabled={loading}
        >
          {loading ? (
            "Redirecting..."
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Pay with Stripe (${selected} USD)
            </>
          )}
        </button>


        
      </div>
    </div>
  );
};

export default Credits;