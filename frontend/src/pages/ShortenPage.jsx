import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const ShortenPage = () => {
  const [form, setForm] = useState({
    originalUrl: '',
    customCode: '',
    title: '',
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        originalUrl: form.originalUrl,
        ...(form.customCode && { customCode: form.customCode }),
        ...(form.title && { title: form.title }),
        ...(form.expiresAt && { expiresAt: form.expiresAt }),
      };
      const { data } = await api.post('/url/shorten', payload);
      setResult(data.url);
      toast.success('Link shortened!');
    } catch (err) {
      const detail = err.response?.data?.details?.[0]?.message;
      toast.error(detail || err.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white mb-2">Create new link</h1>
        <p className="text-slate-400">Paste your long URL and we'll make it short and trackable.</p>
      </div>

      <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
        {/* Original URL */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Long URL <span className="text-red-400">*</span>
          </label>
          <input
            name="originalUrl"
            type="url"
            required
            value={form.originalUrl}
            onChange={handleChange}
            placeholder="https://your-very-long-url.com/path?with=params"
            className="input-field"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Title <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Product launch campaign"
            className="input-field"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Custom code */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Custom alias <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-0">
              <span className="px-3 py-3 bg-surface border border-r-0 border-surface-border rounded-l-lg text-slate-500 text-sm font-mono whitespace-nowrap">
                /
              </span>
              <input
                name="customCode"
                type="text"
                value={form.customCode}
                onChange={handleChange}
                placeholder="my-link"
                maxLength={20}
                className="input-field rounded-l-none"
              />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Expires at <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              name="expiresAt"
              type="datetime-local"
              value={form.expiresAt}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              className="input-field"
            />
          </div>
        </div>

        <button type="submit" disabled={loading || !form.originalUrl} className="btn-primary py-3 text-base w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Shortening…
            </span>
          ) : '⚡ Shorten URL'}
        </button>
      </form>

      {/* Result card */}
      {result && (
        <div className="mt-6 card border-brand-500/40 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-green-400 font-semibold text-sm">Link created successfully</span>
          </div>

          <div className="flex items-center gap-3 bg-surface rounded-lg px-4 py-3 mb-4">
            <span className="text-brand-400 font-mono text-sm font-medium flex-1 truncate">
              {result.shortUrl}
            </span>
            <button
              onClick={() => copyToClipboard(result.shortUrl)}
              className="shrink-0 text-xs bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 border border-brand-500/30 px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              Copy
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div>
              <span className="text-slate-500">Original</span>
              <p className="text-slate-300 truncate mt-0.5">{result.originalUrl}</p>
            </div>
            <div>
              <span className="text-slate-500">Created</span>
              <p className="text-slate-300 mt-0.5">{new Date(result.createdAt).toLocaleDateString()}</p>
            </div>
            {result.expiresAt && (
              <div>
                <span className="text-slate-500">Expires</span>
                <p className="text-yellow-400 mt-0.5">{new Date(result.expiresAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/analytics/${result._id}`)}
              className="flex-1 btn-ghost text-sm border border-surface-border"
            >
              📊 View Analytics
            </button>
            <button
              onClick={() => { setResult(null); setForm({ originalUrl: '', customCode: '', title: '', expiresAt: '' }); }}
              className="flex-1 btn-primary text-sm"
            >
              + Create Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortenPage;
