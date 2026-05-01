import React, { useState } from "react";

const API = "http://192.168.1.6:8080";

const ChangeEmail = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const userId = localStorage.getItem("userId");

  const updateEmail = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API}/api/users/update/email/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify({
      userEmail: email,
      code: code.trim(), 
    }),
  });

  if (res.ok) {
    localStorage.setItem("userEmail", email);
    window.location.href = "/profile";
  } else {
    const text = await res.text();
    console.log(text); // 🔥 debug
    alert("Invalid code");
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Change Email</h2>
            <input
              style={styles.input}
              placeholder="New email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <button style={styles.button} onClick={updateEmail}>
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
  text: {
    fontSize: "14px",
    opacity: 0.8,
    marginBottom: "15px",
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
    background: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },
};

export default ChangeEmail;