"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoEyeOffOutline, IoEyeOutline, IoLeafOutline } from "react-icons/io5";
import "./auth-page.css";

function getResponseMessage(payload, fallback) {
  const value = payload?.data;
  if (typeof value === "string") return value;
  if (typeof value?.mssg === "string") return value.mssg;
  return fallback;
}

function getDestination() {
  const params = new URLSearchParams(window.location.search);
  const next = params.get("next");
  if (next?.startsWith("/") && !next.startsWith("//")) return next;

  if (params.get("page") === "product" && params.get("data")) {
    return `/customer/store/${encodeURIComponent(params.get("data"))}`;
  }

  return "/customer/store";
}

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    if (isRegister && password !== form.get("confirmPassword")) {
      setError("Your passwords do not match. Please check and try again.");
      return;
    }

    const payload = isRegister
      ? {
          fname: String(form.get("firstName") || "").trim(),
          lname: String(form.get("lastName") || "").trim(),
          email: String(form.get("email") || "").trim(),
          phone: String(form.get("phone") || "").trim() || null,
          password,
          role: "customer",
        }
      : {
          email: String(form.get("email") || "").trim(),
          password,
        };

    setLoading(true);
    try {
      const response = await fetch(
        isRegister ? "/api/shared/auth/signup" : "/api/shared/auth/signin",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(
          getResponseMessage(result, "We couldn’t sign you in. Please try again.")
        );
      }

      router.replace(getDestination());
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`dsc-auth-page${isRegister ? " dsc-auth-page--register" : ""}`}>
      <Link className="dsc-auth-back" href="/" aria-label="Back to home">
        <span aria-hidden="true">←</span> Back to home
      </Link>

      <section className="dsc-auth-card" aria-labelledby="auth-title">
        <aside className="dsc-auth-intro">
          <Link href="/" className="dsc-auth-brand" aria-label="Deskinculture Spa home">
            <Image src="/deskinculture_logo.png" alt="" width={42} height={42} />
            <span>DESKIN<span>CULTURE</span></span>
          </Link>
          <div className="dsc-auth-intro-copy">
            <span className="dsc-auth-kicker"><IoLeafOutline aria-hidden="true" /> YOUR MOMENT OF CARE</span>
            <h2>A little time for you.</h2>
            <p>Thoughtful skincare and wellness, tailored to help you feel your best.</p>
          </div>
          <p className="dsc-auth-note">Care that feels like it was made for you.</p>
        </aside>

        <div className="dsc-auth-form-panel">
          <div className="dsc-auth-heading">
            <span className="dsc-auth-heading-kicker">{isRegister ? "WELCOME TO THE COMMUNITY" : "WELCOME BACK"}</span>
            <h1 id="auth-title">{isRegister ? "Create your account" : "Sign in"}</h1>
            <p>{isRegister ? "Create an account to book and shop with us." : "Sign in to continue to your account."}</p>
          </div>

          <form className="dsc-auth-form" onSubmit={handleSubmit}>
            {isRegister && (
              <div className="dsc-auth-name-row">
                <div className="dsc-auth-field">
                  <label htmlFor="firstName">First name</label>
                  <input id="firstName" name="firstName" autoComplete="given-name" required maxLength={80} />
                </div>
                <div className="dsc-auth-field">
                  <label htmlFor="lastName">Last name</label>
                  <input id="lastName" name="lastName" autoComplete="family-name" required maxLength={80} />
                </div>
              </div>
            )}

            <div className="dsc-auth-field">
              <label htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
            </div>

            {isRegister && (
              <div className="dsc-auth-field">
                <label htmlFor="phone">Phone number <span>(optional)</span></label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" />
              </div>
            )}

            <div className="dsc-auth-field">
              <div className="dsc-auth-label-row">
                <label htmlFor="password">Password</label>
              </div>
              <div className="dsc-auth-password-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  required
                />
                <button type="button" className="dsc-auth-visibility" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                  {showPassword ? <IoEyeOffOutline aria-hidden="true" /> : <IoEyeOutline aria-hidden="true" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div className="dsc-auth-field">
                <label htmlFor="confirmPassword">Confirm password</label>
                <div className="dsc-auth-password-wrap">
                  <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" required />
                  <button type="button" className="dsc-auth-visibility" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"} aria-pressed={showConfirmPassword}>
                    {showConfirmPassword ? <IoEyeOffOutline aria-hidden="true" /> : <IoEyeOutline aria-hidden="true" />}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="dsc-auth-error" role="alert">{error}</p>}

            <button className="dsc-auth-submit" type="submit" disabled={loading}>
              {loading ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="dsc-auth-switch">
            {isRegister ? "Already have an account? " : "New to Deskinculture? "}
            <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
          </p>
          <p className="dsc-auth-legal">By continuing, you agree to our care being personal, considered, and always yours.</p>
        </div>
      </section>
    </div>
  );
}
