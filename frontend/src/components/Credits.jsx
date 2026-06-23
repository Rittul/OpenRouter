import React, { useContext, useState } from "react";
import { ProfileContext } from "../context/Profilcontext";
import "../css/Credits.css";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
const QUICK_AMOUNTS = [100, 250, 500, 1000];

const Credits = () => {
  // const { profile } = useContext(ProfileContext);
  const { profile, setProfile } = useContext(ProfileContext);
  const [selected, setSelected] = useState(100);
  const [loading, setLoading] = useState(false);

  // const handleAddCredit = async () => {
  //   setLoading(true);
  //   try {
  //     console.log("adding credits:", selected);
  //     await axios.post(`${BASE_URL}/add-credits`, { amount: selected },{withCredentials:true})
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleAddCredit = async () => {
  setLoading(true);

  try {
    const res = await axios.post(
      `${BASE_URL}/add-credits`,
      { amount: selected },
      { withCredentials: true }
    );

    setProfile(prev => ({
      ...prev,
      balance: res.data.balance
    }));
  } finally {
    setLoading(false);
  }
};

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
        <span className="credits__balance-label">Current balance</span>
        <span className="credits__balance-value">
          ${Number(profile?.balance ?? 0).toFixed(2)}
        </span>
        <span className="credits__balance-note">
          Used across all API requests and models
        </span>
      </div>

      {/* ── ADD CREDITS ── */}
      <div className="credits__add-card">
        <h3 className="credits__add-title">Add credits</h3>
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

        <button
          className="credits__add-btn"
          onClick={handleAddCredit}
          disabled={loading}
        >
          {loading ? "Adding..." : `Add $${selected} credits`}
        </button>

        <p className="credits__disclaimer">
          Payments aren't wired up yet — this just adds credits directly for testing.
        </p>
      </div>
    </div>
  );
};

export default Credits;