import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roleError, setRoleError] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [forgotStep, setForgotStep] = useState('idle'); // idle | sent | verified
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetConfirmPasswordValue, setResetConfirmPasswordValue] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Get API base URL from environment variable or use backend default (3000)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear any previous role-based error when user edits form
    setRoleError('');
    setError('');
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
      await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailToUse })
      });
      toast.success('If an account exists, an OTP has been sent to your email.');
      setForgotStep('sent');
    } catch (err) {
      console.error('Forgot password error (student):', err);
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
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: emailToUse, otp })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Invalid or expired OTP.';
        throw new Error(message);
      }

      if (data.resetToken) {
        localStorage.setItem('passwordResetToken', data.resetToken);
        setResetToken(data.resetToken);
      }
      toast.success('OTP verified. Please set a new password.');
      setForgotStep('verified');
    } catch (err) {
      console.error('Verify OTP error (student):', err);
      toast.error(err.message || 'Invalid or expired OTP. Please request a new one.');
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
    const tokenToUse = resetToken || localStorage.getItem('passwordResetToken');
    if (!tokenToUse) {
      toast.error('Reset token missing. Please restart the forgot password process.');
      return;
    }
    try {
      setResetLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: tokenToUse,
          newPassword: resetPasswordValue,
          confirmPassword: resetConfirmPasswordValue
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const message = data?.error || 'Failed to reset password.';
        throw new Error(message);
      }

      toast.success('Password reset successfully. You can now log in with your new password.');
      localStorage.removeItem('passwordResetToken');
      setShowForgot(false);
      setForgotStep('idle');
      setOtp('');
      setResetPasswordValue('');
      setResetConfirmPasswordValue('');
      setResetToken('');
    } catch (err) {
      console.error('Reset password error (student):', err);
      const message = err.message || 'Failed to reset password.';
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

    try {
      console.log('Attempting login with:', formData);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);

      // Try to parse JSON even on error responses so we can show friendly messages
      let data;
      try {
        data = await response.json();
      } catch (parseErr) {
        console.error('Failed to parse response JSON:', parseErr);
      }

      if (!response.ok) {
        // Prefer a clear error message from backend
        let message = data?.error;

        // Normalize some common backend error texts
        if (message === 'Invalid email or password') {
          message = 'Incorrect email or password.';
        }

        // Handle validation errors with field details (e.g. short password)
        if (!message && data?.details?.fieldErrors) {
          const fieldErrors = data.details.fieldErrors;
          const firstField = Object.keys(fieldErrors)[0];
          const firstError = Array.isArray(fieldErrors[firstField]) ? fieldErrors[firstField][0] : undefined;

          if (firstField === 'password') {
            // Show simple, friendly password message instead of Zod technical text
            message = 'Password must be at least 8 characters long.';
          } else if (firstField === 'email') {
            message = 'Please enter a valid email address.';
          } else if (firstError) {
            // Fallback to first validation message if we don't recognize the field
            message = firstError;
          }
        }

        if (!message) {
          message = 'Login failed. Please check your credentials and try again.';
        }

        console.error('Login failed with message:', message, 'raw data:', data);
        setError(message);
        throw new Error(message);
      }

      // Successful login
      if (!data) {
        throw new Error('Unexpected empty response from server. Please try again.');
      }

      console.log('Full response data:', data);
      console.log('Full response data:', data);

      // Debug: Check the actual role and user data
      console.log('User role:', data.user?.role);
      console.log('User data:', data.user);

      // Check for student role (case insensitive)
      const userRole = data.user?.role?.toLowerCase();
      if (userRole === 'student') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        toast.success('Welcome back! Login successful!');
        navigate('/student-dashboard');
      } else {
        console.warn('Access denied - user role:', data.user?.role);
        const message = `Access denied. Student credentials required. You are currently logged in as "${data.user?.role || 'unknown'}".`;
        setRoleError(message);
      }
    } catch (error) {
      console.error('Login error:', error);
      // If error message is already set from response, keep it; otherwise, set a generic one
      if (!error.message && !error?.message) {
        setError('Login failed. Please check your credentials and try again.');
      } else if (!error) {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            {/* <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-white" />
            </div> */}
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Student Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your placement portal
            </p>
          </div>

          {roleError && (
            <div className="rounded-md bg-yellow-50 border border-yellow-300 px-4 py-3 text-sm text-yellow-800 shadow-sm">
              {roleError}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-800 shadow-sm">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowForgot((prev) => !prev)}
                className="text-xs text-blue-600 hover:text-blue-500"
              >
                Forgot Password?
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/student-register" className="font-medium text-blue-600 hover:text-blue-500">
                  Register here
                </Link>
              </p>
            </div>

            <div className="text-center">
              {/* <p className="text-xs text-gray-500">
                Demo Account: student@example.com / student123
              </p> */}
            </div>
          </form>

          {showForgot && (
            <div className="mt-4 border-t border-gray-200 pt-4">
              <h2 className="text-sm font-semibold mb-2">Reset Password</h2>
              <form className="space-y-3" autoComplete="off">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium">Registered Email</label>
                  <input
                    type="email"
                    value={forgotEmail || formData.email}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="h-9 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                      className="h-9 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm tracking-[0.3em]"
                    />
                  </div>
                )}

                {forgotStep !== 'verified' && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleForgotRequest}
                      disabled={forgotLoading}
                      className="flex-1 h-9 rounded-md border border-blue-600 text-blue-600 text-xs font-medium hover:bg-blue-50 disabled:opacity-60"
                    >
                      {forgotStep === 'sent' ? 'Resend OTP' : 'Send OTP'}
                    </button>
                    {forgotStep === 'sent' && (
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={forgotLoading}
                        className="flex-1 h-9 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60"
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
                          className="h-9 w-full pl-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                        >
                          {showResetPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
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
                          className="h-9 w-full pl-3 pr-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                          aria-label={showResetConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showResetConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetPassword}
                      disabled={resetLoading}
                      className="w-full h-9 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60"
                    >
                      {resetLoading ? 'Resetting...' : 'Set New Password'}
                    </button>
                  </>
                )}

                <p className="text-[10px] text-gray-500">
                  We will not reveal whether this email is registered. If the OTP is valid, a temporary reset token
                  will be stored securely in your browser and used to update your password.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentLogin;