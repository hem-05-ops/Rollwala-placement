
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { signin, forgotPassword, verifyOtp, resetPassword } from '../../api/auth';
import { toast } from 'react-hot-toast';
import Header from './Header';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [forgotStep, setForgotStep] = useState('idle'); // idle | sent | verified
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetConfirmPasswordValue, setResetConfirmPasswordValue] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  setError(''); // Clear error when user types
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    const emailToUse = forgotEmail || formData.email;
    if (!emailToUse) {
      toast.error('Please enter your registered email.');
      return;
    }
    try {
      setForgotLoading(true);
      await forgotPassword(emailToUse);
      toast.success('If an account exists, an OTP has been sent to your email.');
      setForgotStep('sent');
    } catch (err) {
      console.error('Forgot password error (admin):', err);
      // Keep generic message to avoid leaking user existence
      toast.success('If an account exists, an OTP has been sent to your email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const emailToUse = forgotEmail || formData.email;
    if (!emailToUse || !otp) {
      toast.error('Please enter email and OTP.');
      return;
    }
    try {
      setForgotLoading(true);
      const res = await verifyOtp({ email: emailToUse, otp });
      if (res.resetToken) {
        localStorage.setItem('passwordResetToken', res.resetToken);
      }
      toast.success('OTP verified. Please set a new password.');
      setForgotStep('verified');
    } catch (err) {
      console.error('Verify OTP error (admin):', err);
      const message = err?.response?.data?.error || 'Invalid or expired OTP. Please request a new one.';
      toast.error(message);
      setForgotStep('idle');
      setOtp('');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPasswordValue || !resetConfirmPasswordValue) {
      toast.error('Please enter and confirm your new password.');
      return;
    }
    if (resetPasswordValue !== resetConfirmPasswordValue) {
      toast.error('Passwords do not match.');
      return;
    }
    const token = localStorage.getItem('passwordResetToken');
    if (!token) {
      toast.error('Reset token missing. Please restart the forgot password process.');
      return;
    }
    try {
      setResetLoading(true);
      await resetPassword({
        token,
        newPassword: resetPasswordValue,
        confirmPassword: resetConfirmPasswordValue
      });
      toast.success('Password reset successfully. You can now log in with your new password.');
      localStorage.removeItem('passwordResetToken');
      setShowForgot(false);
      setForgotStep('idle');
      setOtp('');
      setResetPasswordValue('');
      setResetConfirmPasswordValue('');
    } catch (err) {
      console.error('Reset password error (admin):', err);
      const message = err?.response?.data?.error || 'Failed to reset password.';
      if (message.toLowerCase().includes('reset token')) {
        toast.error('Your reset session expired. Please request a new OTP.');
        localStorage.removeItem('passwordResetToken');
        setForgotStep('idle');
        setOtp('');
      } else {
        toast.error(message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', formData);
      const response = await signin(formData);
      console.log('Login response:', response);
      
      // Check if user has admin role
      if (response.user && (response.user.role === 'admin' || response.user.role === 'super_admin')) {
        const redirectPath = response.user.role === 'super_admin' ? '/admin-analytics' : '/admin-job-posting';
        console.log('Admin login successful, redirecting to:', redirectPath);
        console.log('User role:', response.user.role);
        toast.success('Welcome, admin! Redirecting...');
        // Token and user info are already stored in auth.js
        // Redirect based on role: super_admin to analytics, admin to job posting
        navigate(redirectPath);
        // Fallback navigation if React Router doesn't work
        setTimeout(() => {
          if (window.location.pathname !== redirectPath) {
            console.log('React Router navigation failed, using window.location');
            window.location.href = redirectPath;
          }
        }, 1000);
      } else {
        console.log('Access denied - user role:', response.user?.role);
        const msg = 'Access denied. Admin privileges required.';
        setError(msg);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#f3f4ff] via-[var(--color-bg)] to-[var(--color-bg-muted)]">
      <Header />
      <div className="relative w-full flex items-center justify-center py-16 px-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(56,189,248,0.18),_transparent_55%)]"></div>
        <div className="w-full max-w-md bg-[var(--color-surface)]/95 backdrop-blur-md text-[var(--color-text)] shadow-xl rounded-[var(--radius-lg)] border border-[var(--color-border)]/70 p-6 sm:p-8 relative">
          <div className="flex flex-col items-center gap-2 mb-7">
            {/** Temporarily hidden logo */}
            {/** <img src="/default-logo.png" alt="Logo" className="h-10 w-10 rounded-md" /> */}
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Admin Login</h1>
            <p className="text-sm text-[var(--color-text-muted)]">Access the Placement Management System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-500" role="alert">{error}</div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@example.com"
                className="h-11 px-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="h-11 w-full pr-10 pl-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-2 flex items-center text-[var(--color-text-muted)] hover:text-[var(--color-primary)] focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setShowForgot((prev) => !prev)}
                className="text-xs text-[var(--color-primary)] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-700)] text-white font-medium shadow-[var(--elev-2)] disabled:opacity-60 transition-colors"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {showForgot && (
            <div className="mt-6 border-t border-[var(--color-border)] pt-4">
              <h2 className="text-sm font-semibold mb-2">Reset Password</h2>
              <form className="space-y-3" autoComplete="off">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">Registered Email</label>
                  <input
                    type="email"
                    value={forgotEmail || formData.email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="h-9 px-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                  />
                </div>

                {forgotStep === 'sent' && (
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

                {forgotStep !== 'verified' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleForgotRequest}
                      disabled={forgotLoading}
                      className="flex-1 h-9 rounded-md border border-[var(--color-primary)] text-[var(--color-primary)] text-xs font-medium hover:bg-[var(--color-primary)]/5 disabled:opacity-60"
                    >
                      {forgotStep === 'sent' ? 'Resend OTP' : 'Send OTP'}
                    </button>
                    {forgotStep === 'sent' && (
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

                {forgotStep === 'verified' && (
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
                      {resetLoading ? 'Resetting...' : 'Set New Password'}
                    </button>
                  </>
                )}

                <p className="text-[10px] text-[var(--color-text-muted)]">
                  We will not reveal whether this email is registered. If the OTP is valid, a temporary reset
                  token will be stored securely in your browser and used to update your password.
                </p>
              </form>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            <p>🔒 Secure access for authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
