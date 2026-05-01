import React, { useState } from "react";

const API = "http://192.168.1.6:8080";

const ChangePassword = () => {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const userId = localStorage.getItem("userId");

  const updatePassword = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/api/users/update/password/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔥 REQUIRED
        },
        body: JSON.stringify({
          userPassword: password,
          code: code.trim(), // 🔥 IMPORTANT
        }),
      });

      if (res.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (!res.ok) {
        const text = await res.text();
        console.log("Error:", text);
        alert("Invalid or expired code");
        return;
      }

      // ⚠️ DO NOT store password in localStorage (bad practice)
      localStorage.setItem("userPassword", password)

      window.location.href = "/profile";

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Change Password</h2>

        <input
          style={styles.input}
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          style={styles.input}
          placeholder="Verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button style={styles.button} onClick={updatePassword}>
          Confirm
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0f172a",
  },
  card: {
    width: "350px",
    padding: "25px",
    borderRadius: "15px",
    background: "#111827",
    color: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "none",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "#10b981",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default ChangePassword;