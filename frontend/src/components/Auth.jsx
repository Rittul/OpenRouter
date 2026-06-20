import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import "../CSS/Auth.css";

const Auth = ({ onClose }) => {
  const [flag, setFlag] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setemailId] = useState("");
  const [password, setPassword] = useState("");
  const [error, seterror] = useState("");

  const handlelogin = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { email, password });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }
      alert("login Successfull!");
      onClose?.();
      // navigate("/home");
    } catch (err) {
      seterror(err.response?.data?.message || "Something went wrong");
      setTimeout(() => {
        seterror("");
      }, 3000);
    }
  };

  const handlesignup = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/signup`, { username, email, password });
      alert("Registered successfully....now log in");
      setFlag(true);
    } catch (err) {
      seterror(err.response?.data?.message || "Something went wrong");
      setTimeout(() => {
        seterror("");
      }, 3000);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth_main" onClick={(e) => e.stopPropagation()}>
        <button className="auth_close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {flag ? (
          <>
            <h2 className="auth_title">Welcome back</h2>
            <p className="auth_subtitle">Log in to continue to OpenRouter</p>

            <h3>Email id:</h3>
            <input
              type="text"
              value={email}
              onChange={(e) => setemailId(e.target.value)}
            />
            <h3>Password</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="auth_submit" onClick={handlelogin}>Login</button>
            {error && <p className="auth_error">{error}</p>}
            <p
              className="auth_toggle"
              onClick={() => {
                setFlag(!flag);
              }}
            >
              New user? <span>Create an account</span>
            </p>
          </>
        ) : (
          <>
            <h2 className="auth_title">Create account</h2>
            <p className="auth_subtitle">Get started with OpenRouter for free</p>

            <h3>Username</h3>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <h3>Email id:</h3>
            <input
              type="text"
              value={email}
              onChange={(e) => setemailId(e.target.value)}
            />
            <h3>Password</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="auth_submit" onClick={handlesignup}>Sign up</button>
            {error && <p className="auth_error">{error}</p>}
            <p
              className="auth_toggle"
              onClick={() => {
                setFlag(!flag);
              }}
            >
              Already have an account? <span>Log in</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;