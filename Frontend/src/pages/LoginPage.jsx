import { useState } from "react";
import "./LoginPage.css";

const SSOButtons = () => (
    <div className="sso">
        <a className="fa-brands fa-facebook" />
        <a className="fa-brands fa-x-twitter" />
        <a className="fa-brands fa-linkedin" />
    </div>
);

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

const AuthForm =
    ({ type, active, title, children }) => (
        <div className={`form ${type} ${active ? "active" : ""}`}
        >
            <h2>{title}</h2>
            <SSOButtons />
            <p>or use your email account</p>
            <form>{children}</form>
        </div>
    );

export const LoginPage = () => {
    const [view, setView] = useState("signup");
    const isSignup = view === "signup";
    const toggleView = () => setView(isSignup ? "signin" : "signup");

    return (
        <div className="login-wrapper">
            <div className="card">
                <div className={`card-bg ${isSignup ? "signup" : "signin"}`} />
                <Hero
                    type="signup"
                    active={isSignup}
                    title="Welcome To HoloRoom!"
                    text="Start your shopping journey with us!"
                    buttonText="Sign In"
                    onClick={toggleView}
                />
                <AuthForm
                    type="signup" active={isSignup}>
                    <input type="text" placeholder="Username" />
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Password" />
                    <button type="submit">Sign Up</button>
                </AuthForm>
                <Hero
                    type="signin"
                    active={!isSignup}
                    title="Welcom Back!"
                    text="Sign in for an amazing shopping experience!"
                    buttonText="Sign Up"
                    onClick={toggleView} />
                <AuthForm
                    type="signin" active={!isSignup} title="Sign in">
                    <input type="email" placeholder="Email" />
                    <input type="password" placeholder="Password" />
                    <a>Forgot password?</a>
                    <button type="submit">Sign In</button>
                </AuthForm>
            </div>
        </div>

    )
}