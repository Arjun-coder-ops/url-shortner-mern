import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.password.trim()) nextErrors.password = 'Password is required';
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mt-3 mb-2">Sign in</h1>
          <p className="text-slate-400">Use your account to access your dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`input-field ${errors.email ? 'border-red-500/70 focus:ring-red-500' : ''}`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`input-field ${errors.password ? 'border-red-500/70 focus:ring-red-500' : ''}`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 mt-1 text-base"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-400">
            No account?{' '}
            <Link
              to="/register"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Create one for free
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
