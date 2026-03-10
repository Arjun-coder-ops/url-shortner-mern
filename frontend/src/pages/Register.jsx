import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = useCallback((e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email) errs.email = 'Email is required';
    if (!form.password || form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Lynkr 🎉');
      navigate('/dashboard');
    } catch (err) {
      const detail = err.response?.data?.details?.[0]?.message;
      const msg = detail || err.response?.data?.error || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ name, label, type = 'text', placeholder, autoComplete }) => (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`input-field ${errors[name] ? 'border-red-500/70 focus:ring-red-500' : ''}`}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🔗</span>
          <h1 className="text-3xl font-extrabold text-white mt-3 mb-2">Create your account</h1>
          <p className="text-slate-400">Start shortening links for free</p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
          <Field name="name" label="Full name" placeholder="Jane Doe" autoComplete="name" />
          <Field name="email" label="Email" type="email" placeholder="you@example.com" autoComplete="email" />
          <Field name="password" label="Password" type="password" placeholder="At least 6 characters" autoComplete="new-password" />
          <Field name="confirm" label="Confirm password" type="password" placeholder="Repeat password" autoComplete="new-password" />

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1 text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
