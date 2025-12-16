import React, { useState } from "react";
import { signup, signin, forgotPassword, verifyOtp, resetPassword } from "../../api/auth";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

function Sign() {
  // Register vs Sign-in
  const [isRegister, setIsRegister] = useState(false);

  // Form state -- added phone for registration (assumption: phone required on register)
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [valid, setValid] = useState({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [forgotStep, setForgotStep] = useState("idle"); // idle | sent | verified
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetConfirmPasswordValue, setResetConfirmPasswordValue] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Simple validators
  const validateField = (name, value) => {
    let error = "";
    // Custom required messages per field
    const requiredMessages = {
      name: "Username is required",
      email: "Email is required",
      password: "Password is required",
      confirmPassword: "Confirm password is required",
    };

    // If empty, show a field-specific required message
    if (!value || (typeof value === "string" && !value.trim())) {
      error = requiredMessages[name] || "This field is required";
    } else if (name === "email") {
      // specific format validation
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email address";
    } else if (name === "password") {
      if (value.length < 6) error = "Password must be at least 6 characters";
    } else if (name === "confirmPassword") {
      if (value !== form.password) error = "Passwords do not match";
    }

    setErrors((p) => ({ ...p, [name]: error }));
    setValid((p) => ({ ...p, [name]: !error }));
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // real-time validation on input
    validateField(name, value);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((p) => ({ ...p, [name]: true }));
    validateField(name, value);
  };

  const validateAll = () => {
    const fields = isRegister
      ? ["name", "email", "password", "confirmPassword"]
      : ["email", "password"];
    let hasError = false;
    fields.forEach((f) => {
      const err = validateField(f, form[f] || "");
      if (err) hasError = true;
    });
    return !hasError;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;
    try {
      const res = await signup(form);
      if (res.error) {
        setErrors({ general: res.error });
        toast.error(res.error || "Registration failed");
        return;
      }
      localStorage.setItem('isLoggedIn', 'true');
      toast.success("Account created. Redirecting...");
      window.location.href = '/';
    } catch (err) {
      if (err.response && err.response.status === 409) {
        const msg = "User already exists with this email.";
        setErrors({ general: msg });
        toast.error(msg);
      } else {
        const msg = "Registration failed. Please try again.";
        setErrors({ general: msg });
        toast.error(msg);
      }
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!validateAll()) return;
    // Await the API call
    const res = await signin(form);
    console.log("Sign-in response:", res);
    if (res.error) {
      toast.error(res.error || "Sign-in failed");
      return;
    }
    // Set login state
    localStorage.setItem('isLoggedIn', 'true');
    toast.success("Signed in as " + form.email);
    // Redirect to home or dashboard
    window.location.href = '/';
    setForm({ name: "", email: "", password: "", confirmPassword: "" });
    setErrors({});
    setTouched({});
    setValid({});
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    const emailToUse = forgotEmail || form.email;
    if (!emailToUse) {
      toast.error("Please enter your registered email.");
      return;
    }
    try {
      setForgotLoading(true);
      await forgotPassword(emailToUse);
      toast.success("If an account exists, an OTP has been sent to your email.");
      setForgotStep("sent");
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.success("If an account exists, an OTP has been sent to your email.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const emailToUse = forgotEmail || form.email;
    if (!emailToUse || !otp) {
      toast.error("Please enter email and OTP.");
      return;
    }
    try {
      setForgotLoading(true);
      const res = await verifyOtp({ email: emailToUse, otp });
      if (res.resetToken) {
        localStorage.setItem("passwordResetToken", res.resetToken);
      }
      toast.success("OTP verified. Please set a new password.");
      setForgotStep("verified");
    } catch (err) {
      console.error("Verify OTP error:", err);
      const message = err?.response?.data?.error || "Invalid or expired OTP. Please request a new one.";
      toast.error(message);
      setForgotStep("idle");
      setOtp("");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordValue || !resetConfirmPasswordValue) {
      toast.error("Please enter and confirm your new password.");
      return;
    }
    if (resetPasswordValue !== resetConfirmPasswordValue) {
      toast.error("Passwords do not match.");
      return;
    }
    const token = localStorage.getItem("passwordResetToken");
    if (!token) {
      toast.error("Reset token missing. Please restart the forgot password process.");
      return;
    }
    try {
      setResetLoading(true);
      await resetPassword({
        token,
        newPassword: resetPasswordValue,
        confirmPassword: resetConfirmPasswordValue
      });
      toast.success("Password reset successfully. You can now log in with your new password.");
      localStorage.removeItem("passwordResetToken");
      setShowForgot(false);
      setForgotStep("idle");
      setOtp("");
      setResetPasswordValue("");
      setResetConfirmPasswordValue("");
    } catch (err) {
      console.error("Reset password error:", err);
      const message = err?.response?.data?.error || "Failed to reset password.";
      if (message.toLowerCase().includes("reset token")) {
        toast.error("Your reset session expired. Please request a new OTP.");
        localStorage.removeItem("passwordResetToken");
        setForgotStep("idle");
        setOtp("");
      } else {
        toast.error(message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center py-10">
      <div className="w-full max-w-md bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--elev-2)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 sm:p-8">
        <div className="flex flex-col items-center gap-2 mb-6">
          <img src="/default-logo.png" alt="Logo" className="h-10 w-10 rounded-md" />
          <h2 className="text-2xl font-semibold tracking-tight">
            {isRegister ? "Create your account" : "Welcome back"}
          </h2>
          <p className="text-sm text-[var(--color-text-muted)]">
            {isRegister ? "Start your placement journey in minutes" : "Sign in to continue"}
          </p>
        </div>

        <form onSubmit={isRegister ? handleRegister : handleSignIn} noValidate className="space-y-4">
          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`h-11 px-3 rounded-md bg-[var(--color-bg)] border ${errors.name ? "border-red-500" : valid.name ? "border-emerald-500" : "border-[var(--color-border)]"} focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
                aria-invalid={!!errors.name}
                aria-describedby="name-error"
              />
              {((touched.name || errors.name) && errors.name) && (
                <div id="name-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                  <span aria-hidden="true">⚠</span>
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`h-11 px-3 rounded-md bg-[var(--color-bg)] border ${errors.email ? "border-red-500" : valid.email ? "border-emerald-500" : "border-[var(--color-border)]"} focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
            />
            {((touched.email || errors.email) && errors.email) && (
              <div id="email-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span>
                <span>{errors.email}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`h-11 px-3 rounded-md bg-[var(--color-bg)] border ${errors.password ? "border-red-500" : valid.password ? "border-emerald-500" : "border-[var(--color-border)]"} focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
            />
            {((touched.password || errors.password) && errors.password) && (
              <div id="password-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                <span aria-hidden="true">⚠</span>
                <span>{errors.password}</span>
              </div>
            )}
          </div>

          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmpassword" className="text-sm font-medium">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`h-11 px-3 rounded-md bg-[var(--color-bg)] border ${errors.confirmPassword ? "border-red-500" : valid.confirmPassword ? "border-emerald-500" : "border-[var(--color-border)]"} focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]`}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby="confirm-error"
              />
              {((touched.confirmPassword || errors.confirmPassword) && errors.confirmPassword) && (
                <div id="confirm-error" className="text-sm text-red-500 flex items-center gap-1" role="alert">
                  <span aria-hidden="true">⚠</span>
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>
          )}

          <button type="submit" className="w-full h-11 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-700)] text-white font-medium shadow-[var(--elev-1)]">
            {isRegister ? "Create account" : "Sign In"}
          </button>
        </form>

        {!isRegister && (
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgot((prev) => !prev)}
              className="text-xs text-[var(--color-primary)] hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {!isRegister && showForgot && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <h2 className="text-sm font-semibold mb-2">Reset Password</h2>
            <form className="space-y-3" autoComplete="off">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium">Registered Email</label>
                <input
                  type="email"
                  value={forgotEmail || form.email}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-9 px-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                />
              </div>

              {forgotStep === "sent" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">Enter 6-digit OTP</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="h-9 px-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm tracking-[0.3em]"
                  />
                </div>
              )}

              {forgotStep !== "verified" && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleForgotRequest}
                    disabled={forgotLoading}
                    className="flex-1 h-9 rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-medium hover:bg-[var(--color-primary)]/5 disabled:opacity-60"
                  >
                    {forgotStep === "sent" ? "Resend OTP" : "Send OTP"}
                  </button>
                  {forgotStep === "sent" && (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={forgotLoading}
                      className="flex-1 h-9 rounded-md bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-700)] disabled:opacity-60"
                    >
                      Verify OTP
                    </button>
                  )}
                </div>
              )}

              {forgotStep === "verified" && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">New Password</label>
                    <div className="relative">
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        name="new-password"
                        autoComplete="new-password"
                        value={resetPasswordValue}
                        onChange={(e) => setResetPasswordValue(e.target.value)}
                        placeholder="Enter new password"
                        className="h-9 w-full pr-10 pl-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-2 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] focus:outline-none"
                        aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showResetConfirmPassword ? 'text' : 'password'}
                        name="confirm-new-password"
                        autoComplete="new-password"
                        value={resetConfirmPasswordValue}
                        onChange={(e) => setResetConfirmPasswordValue(e.target.value)}
                        placeholder="Confirm new password"
                        className="h-9 w-full pr-10 pl-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-2 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] focus:outline-none"
                        aria-label={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showResetConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="w-full h-9 rounded-md bg-[var(--color-primary)] text-white text-xs font-medium hover:bg-[var(--color-primary-700)] disabled:opacity-60"
                  >
                    {resetLoading ? "Resetting..." : "Set New Password"}
                  </button>
                </>
              )}

              <p className="text-[10px] text-[var(--color-text-muted)]">
                We will not reveal whether this email is registered. If the OTP is valid, a temporary reset token
                will be stored securely in your browser and used to update your password.
              </p>
            </form>
          </div>
        )}

        {errors.general && (
          <div className="mt-3 text-sm text-red-500" role="alert">{errors.general}</div>
        )}

        <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsRegister(false)} className="text-[var(--color-primary)] hover:underline">
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New user?{' '}
              <button type="button" onClick={() => setIsRegister(true)} className="text-[var(--color-primary)] hover:underline">
                Create an account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sign;