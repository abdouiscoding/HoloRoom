import { useState, useCallback } from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

const address = "192.168.1.6";

// --- COMPONENTS ---

const SSOButtons = () => (
    <div className="sso">
        <a className="fa-brands fa-facebook" />
        <a className="fa-brands fa-x-twitter" />
        <a className="fa-brands fa-linkedin" />
    </div>
);

const Hero = ({ type, active, title, text, buttonText, onClick }) => (
    <div className={`hero ${type} ${active ? "active" : ""}`}>
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
            <p id="logerror"></p>
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
            <p id="signerror"></p>
        </form>
    </div>
);

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

// --- MAIN PAGE ---

export const LoginPage = () => {
    const navigate = useNavigate();
    const [view, setView] = useState("signup");
    const isSignup = view === "signup";
    
    // Form States
    const [info, setInfo] = useState("");
    const [userName, setUserName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [userPassword, setUserPassword] = useState("");
    
    // Verification Popup States
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    const [toasts, setToasts] = useState([]);

    const toggleView = () => setView(isSignup ? "signin" : "signup");

    const showToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, visible: true }]);
        setTimeout(() => {
            setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 400);
        }, 4000);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)));
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 400);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://${address}:8080/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ info, userPassword })
            });

            const data = await response.json();
            if (!response.ok) {
                showToast(data.message, "error");
                return;
            }

            const token = data.token;
            localStorage.setItem("userPassword", userPassword);

            const userDetailsResponse = await fetch(`http://${address}:8080/api/users/getbyinfo/${info}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (userDetailsResponse.ok) {
                const userData = await userDetailsResponse.json();
                localStorage.setItem("token", token);
                localStorage.setItem("userId", userData.userId);
                localStorage.setItem("userEmail", userData.userEmail);
                localStorage.setItem("userName", userData.userName);
                localStorage.setItem("shipping", userData.shipping);
                localStorage.setItem("userImage", userData.userImage);
                localStorage.setItem("loggedin", "true");

                showToast("Login successful", "success");
                navigate(-1);
            } else {
                localStorage.setItem("token", token);
                showToast("Login successful", "success");
                setTimeout(() => navigate("/"), 1500);
            }
        } catch (error) {
            showToast("Login unsuccessful", "error");
        }
    };

    // --- STEP 1: START REGISTRATION ---
    const handleSignup = async (e) => {
        if (e) e.preventDefault();
        try {
            const response = await fetch(`http://${address}:8080/api/auth/register/start`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userName, userEmail, userPassword })
            });

            const data = await response.json();
            if (!response.ok) {
                showToast(data.message, "error");
                return;
            }

            showToast("Verification code sent to your email!", "success");
            setShowVerifyModal(true);
        } catch (error) {
            showToast("Signup failed to initiate", "error");
        }
    };

    // --- STEP 2: CONFIRM REGISTRATION ---
    const handleConfirmCode = async () => {
        setIsVerifying(true);
        try {
            const response = await fetch(`http://${address}:8080/api/auth/register/confirm`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userEmail, code: verificationCode })
            });

            const data = await response.json();
            if (!response.ok) {
                showToast(data.message, "error");
                setIsVerifying(false);
                return;
            }

            showToast("Account verified! You can now sign in.", "success");
            setShowVerifyModal(false);
            setVerificationCode("");
            setView("signin");
        } catch (error) {
            showToast("Verification failed", "error");
        } finally {
            setIsVerifying(false);
        }
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

            {/* VERIFICATION POPUP */}
            {showVerifyModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Verify Your Email</h3>
                        <p>Please enter the 6-digit code sent to <strong>{userEmail}</strong></p>
                        <input 
                            type="text" 
                            placeholder="Enter Code" 
                            value={verificationCode} 
                            onChange={(e) => setVerificationCode(e.target.value)}
                            maxLength={6}
                        />
                        <div className="modal-actions">
                            <button className="confirm-btn" onClick={handleConfirmCode} disabled={isVerifying}>
                                {isVerifying ? "Verifying..." : "Confirm"}
                            </button>
                            <button className="resend-btn" onClick={() => handleSignup(null)}>
                                Resend Code
                            </button>
                            <button className="cancel-btn" onClick={() => setShowVerifyModal(false)}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className={`card-bg ${isSignup ? "signup" : "signin"}`} />
                
                <Hero
                    type="signup"
                    active={isSignup}
                    title="Welcome to HoloRoom!"
                    text="Already have an account?"
                    buttonText="Sign In"
                    onClick={toggleView}
                />

                <AuthFormForSignup type="signup" active={isSignup} title="Sign Up" onSubmit={handleSignup}>
                    <input type="text" placeholder="Username" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                    <input type="email" placeholder="Email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required />
                    <input type="password" placeholder="Password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required />
                    <button type="submit">Send Code</button>
                </AuthFormForSignup>

                <Hero
                    type="signin"
                    active={!isSignup}
                    title="Welcome Back!"
                    text="Don't have an account?"
                    buttonText="Sign Up"
                    onClick={toggleView}
                />

                <AuthFormForLogin type="signin" active={!isSignup} title="Sign in" onSubmit={handleLogin}>
                    <input type="text" placeholder="Username or email" value={info} onChange={(e) => setInfo(e.target.value)} required />
                    <input type="password" placeholder="Password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} required />
                    <a>Forgot password?</a>
                    <button type="submit">Sign In</button>
                </AuthFormForLogin>
            </div>
        </div>
    );
};