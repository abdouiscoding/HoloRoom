import { useState, useCallback } from "react";
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
// Login notification
const Toast = ({ message, type, visible, onClose }) => (
    <div className={`toast-notification ${type} ${visible ? "toast-visible" : "toast-hidden"}`}>
        <div className="toast-icon">
            {type === "success" ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                </svg>
            ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            )}
        </div>
        <span className="toast-message">{message}</span>
        <button className="toast-close" onClick={onClose} aria-label="Close notification">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        </button>
    </div>
);

export const LoginPage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState("signup");
    const isSignup = view === "signup";
    const toggleView = () => setView(isSignup ? "signin" : "signup");

    const [info, setInfo] = useState("");

    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, visible: true }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) =>
                prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
            );
            
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 400);
        }, 4000);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        );
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 400);
    }, []);

    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");


    //handles login
    const handleLogin = async (e) => {
    e.preventDefault();

    try {
        // 1. Authenticate and get Token
        const response = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                info, // Assuming this is the username/email field
                userPassword
            })
        });

        if (!response.ok) {
            showToast("Login unsuccessful", "error");
            return;
        }

        const data = await response.json();
        const token = data.token;

        // 2. Fetch full User details using the token we just got
        // Using 'info' here assuming 'info' holds the userName used to login
        const userDetailsResponse = await fetch(`http://localhost:8080/api/users/getbyuserbyinfo/${info}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (userDetailsResponse.ok) {
            const userData = await userDetailsResponse.json();
            
            // 3. Store everything in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userData.id); // Storing ID for your Cart fetch
            localStorage.setItem("userEmail", userData.userEmail);
            localStorage.setItem("userName", userData.userName);
            localStorage.setItem("loggedin", "true");

            console.log("User data synced:", userData);
            showToast("Login successful", "success");
            setTimeout(() => navigate("/"), 1500);
        } else {
            console.error("Login successful but failed to fetch user profile.");
            // Optional: even if profile fetch fails, you have the token
            localStorage.setItem("token", token);
            showToast("Login successful", "success");
            setTimeout(() => navigate("/"), 1500);
        }

    } catch (error) {
        console.error("Login Error:", error);
        showToast("Login unsuccessful", "error");
    }
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
        return;
   }

   const data = await response.json();
   console.log(data);
    showToast("Account created successfully! Please sign in.", "success");
   console.log("http status: " + response.status);
};

    return (
        <div className="login-wrapper">
            <div className="toast-container">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        visible={toast.visible}
                        onClose={() => dismissToast(toast.id)}
                    />
                ))}
            </div>
            <div className="card">
                <div className={`card-bg ${isSignup ? "signup" : "signin"}`} />
                <Hero
                    type="signup"
                active={isSignup}
                title="Welcome to HoloRoom!"
                text="Already have an account? sign up!"
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
                title="Welcome Back!"
                text="Don't have an account? Sign up!"
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

