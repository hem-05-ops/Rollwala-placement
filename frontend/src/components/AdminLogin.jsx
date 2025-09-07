
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signin } from '../../api/auth';
import { toast } from 'react-hot-toast';
import Header from './Header';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  setError(''); // Clear error when user types
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
        console.log('Admin login successful, redirecting to:', '/admin-job-posting');
        console.log('User role:', response.user.role);
        toast.success('Welcome, admin! Redirecting...');
        // Token and user info are already stored in auth.js
        // Redirect to admin dashboard
        navigate('/admin-job-posting');
        // Fallback navigation if React Router doesn't work
        setTimeout(() => {
          if (window.location.pathname !== '/admin-job-posting') {
            console.log('React Router navigation failed, using window.location');
            window.location.href = '/admin-job-posting';
          }
        }, 1000);
      } else {
        console.log('Access denied - user role:', response.user?.role);
        const msg = 'Access denied. Admin privileges required.';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err?.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--color-bg)]">
      <Header />
      <div className="relative w-full flex items-center justify-center py-12 px-4 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--color-bg-muted)]"></div>
        <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 h-64 w-[40rem] rounded-full bg-[radial-gradient(closest-side,_rgba(37,99,235,0.25),_transparent)] blur-3xl"></div>
        <div className="w-full max-w-md bg-[var(--color-surface)] text-[var(--color-text)] shadow-[var(--elev-2)] rounded-[var(--radius-lg)] border border-[var(--color-border)] p-6 sm:p-8 relative">
          <div className="flex flex-col items-center gap-2 mb-6">
            <img src="/default-logo.png" alt="Logo" className="h-10 w-10 rounded-md" />
            <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
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
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="h-11 px-3 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-700)] text-white font-medium shadow-[var(--elev-1)] disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            <p>🔒 Secure access for authorized personnel only</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
