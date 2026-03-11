import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim() || form.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email is required';
    }
    if (!form.password || form.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirm) {
      nextErrors.confirm = 'Passwords do not match';
    }
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
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      const detail = err?.response?.data?.details?.[0]?.message;
      const msg = detail || err?.response?.data?.error || 'Registration failed.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mt-3 mb-2">
            Create your account
          </h1>
          <p className="text-slate-400">
            Start shortening and tracking your links.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Full name
            </label>
            <input
              name="name"
              type="text"
              autoComplete="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              className={`input-field ${
                errors.name ? 'border-red-500/70 focus:ring-red-500' : ''
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Email
            </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`input-field ${
                errors.email ? 'border-red-500/70 focus:ring-red-500' : ''
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className={`input-field ${
                errors.password ? 'border-red-500/70 focus:ring-red-500' : ''
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Confirm password
            </label>
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={handleChange}
              placeholder="Repeat password"
              className={`input-field ${
                errors.confirm ? 'border-red-500/70 focus:ring-red-500' : ''
              }`}
            />
            {errors.confirm && (
              <p className="mt-1 text-xs text-red-400">{errors.confirm}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 mt-1 text-base"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
