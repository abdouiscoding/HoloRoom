import { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

// displays social media login options 
const SSOButtons = () => (
    <div className="sso">
        <a className="fa-brands fa-facebook" />
        <a className="fa-brands fa-x-twitter" />
        <a className="fa-brands fa-linkedin" />
    </div>
);

// displays side panel with welcome message and toggle button
const Hero =
    ({ type, active, title, text, buttonText, onClick }) => (
        <div
            className={`hero ${type} ${active ? "active" : ""}`}
        >
            <h2>{title}</h2>
            <p>{text}</p>
            <button onClick={onClick}>{buttonText}</button>
        </div>
    );

const AuthFormForLogin = ({ type, active, title, children, onSubmit }) => (
    <div className={`form ${type} ${active ? "active" : ""}`}>
        <h2>{title}</h2>
        <SSOButtons />
        <p>or use your email account</p>
        <form onSubmit={onSubmit}>
            {children}
        </form>
    </div>
);

const AuthFormForSignup = ({ type, active, title, children, onSubmit }) => (
    <div className={`form ${type} ${active ? "active" : ""}`}>
        <h2>{title}</h2>
        <SSOButtons />
        <p>or use your email account</p>
        <form onSubmit={onSubmit}>
            {children}
        </form>
    </div>
);
export const LoginPage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState("signup");
    const isSignup = view === "signup";
    const toggleView = () => setView(isSignup ? "signin" : "signup");

    const [info, setInfo] = useState("");

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");


    //handles login
    const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            info,
            userPassword
        })
    });

    if (!response.ok) {
        alert("Invalid login");
        return;
    }

    const data = await response.json();

    localStorage.setItem("token", data.token);
    localStorage.setItem("userName", userName);
    localStorage.setItem("loggedin", "true");


    console.log("Received token:", data.token);
    console.log("Received userName:", userName);
    alert("Login successful!");

    navigate("/home"); // ✅ or "/home"
};

   //handles signup
   const handleSignup = async (e) => {
   e.preventDefault();

   const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
         "Content-Type": "application/json"
      },
      body: JSON.stringify({
          userName,
          userEmail,
          userPassword
      })
   });

   if (!response.ok) {
       alert("Invalid signup");
       return;
   }

   const data = await response.json();
   console.log(data);
   alert("Signup successful! Please log in.");
   console.log("http status: " + response.status);
};

    return (
        <div className="login-wrapper">
            <div className="card">
                <div className={`card-bg ${isSignup ? "signup" : "signin"}`} />
                <Hero
                    type="signup"
                active={isSignup}
                title="Welcome Back!"
                text="Sign in for an amazing shopping experience!"
                buttonText="Sign In"
                onClick={toggleView}
            />
            <AuthFormForSignup
                type="signup" active={isSignup} title="Sign Up" onSubmit={handleSignup}>
                <input type="text" placeholder="Username" value={userName} onChange={(e) => setUserName(e.target.value)} />
                <input type="email" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                <button type="submit">Sign Up</button>
            </AuthFormForSignup>
            <Hero
                type="signin"
                active={!isSignup}
                title="Welcome To HoloRoom!"
                text="Start your shopping journey with us!"
                buttonText="Sign Up"
                onClick={toggleView} />
            <AuthFormForLogin
                type="signin" active={!isSignup} title="Sign in" onSubmit={handleLogin}>
                <input type="text" placeholder="Username or email" value={info} onChange={(e) => setInfo(e.target.value)} />
                <input type="password" placeholder="Password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                <a>Forgot password?</a>
                <button type="submit">Sign In</button>
            </AuthFormForLogin>
        </div>
        </div>

        

    )
}

