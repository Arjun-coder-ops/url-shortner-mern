import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const chartOptions = (label) => ({
  responsive: true,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      borderColor: '#334155',
      borderWidth: 1,
      titleColor: '#e2e8f0',
      bodyColor: '#94a3b8',
    },
  },
  scales: {
    x: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { size: 11 } },
    },
    y: {
      grid: { color: '#1e293b' },
      ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 },
      beginAtZero: true,
    },
  },
});

const StatCard = ({ label, value, icon, sub }) => (
  <div className="stat-card">
    <div className="flex items-center justify-between">
      <span className="text-2xl">{icon}</span>
      <span className="text-3xl font-extrabold text-white">{value}</span>
    </div>
    <p className="text-sm font-medium text-slate-400">{label}</p>
    {sub && <p className="text-xs text-slate-600">{sub}</p>}
  </div>
);

const Dashboard = () => {
  const [dash, setDash] = useState(null);
  const [links, setLinks] = useState([]);
  const [loadingDash, setLoadingDash] = useState(true);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [qrModal, setQrModal] = useState(null); // { qrCode, shortUrl }
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/url/dashboard');
      setDash(data);
    } catch {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoadingDash(false);
    }
  }, []);

  const fetchLinks = useCallback(async () => {
    try {
      const { data } = await api.get('/url/user-links?limit=20');
      setLinks(data.urls);
    } catch {
      toast.error('Failed to load links');
    } finally {
      setLoadingLinks(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    fetchLinks();
  }, [fetchDashboard, fetchLinks]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/url/${id}`);
      toast.success('Link deleted');
      setLinks((prev) => prev.filter((l) => l._id !== id));
      fetchDashboard();
    } catch {
      toast.error('Failed to delete link');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Copied!');
  };

  const handleQr = async (id) => {
    try {
      const { data } = await api.get(`/url/qr/${id}`);
      setQrModal(data);
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const chartData = dash
    ? {
        labels: dash.clicksOverTime.map((d) =>
          new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
        ),
        datasets: [
          {
            data: dash.clicksOverTime.map((d) => d.clicks),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: '#6366f1',
          },
        ],
      }
    : null;

  const topLinksChart = dash
    ? {
        labels: dash.topLinks.map((l) => l.shortCode),
        datasets: [
          {
            data: dash.topLinks.map((l) => l.clicks),
            backgroundColor: ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
            borderRadius: 6,
          },
        ],
      }
    : null;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {user?.name} 👋</p>
        </div>
        <Link to="/shorten" className="btn-primary">+ New Link</Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {loadingDash ? (
          [0,1,2].map(i => <div key={i} className="stat-card animate-pulse"><div className="h-10 bg-surface-hover rounded" /></div>)
        ) : (
          <>
            <StatCard label="Total Links" value={dash?.totalLinks ?? 0} icon="🔗" />
            <StatCard label="Total Clicks" value={dash?.totalClicks ?? 0} icon="👆" />
            <StatCard label="Top Link Clicks" value={dash?.topLinks?.[0]?.clicks ?? 0} icon="🏆" sub={dash?.topLinks?.[0]?.shortCode} />
          </>
        )}
      </div>

      {/* Charts */}
      {dash && (
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Clicks (last 14 days)</h2>
            {chartData && <Line data={chartData} options={chartOptions('Clicks')} height={120} />}
          </div>
          <div className="card">
            <h2 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Top 5 Links</h2>
            {topLinksChart && <Bar data={topLinksChart} options={chartOptions('Clicks')} height={120} />}
          </div>
        </div>
      )}

      {/* Links table */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-white">Your Links</h2>
          <span className="text-xs text-slate-500">{links.length} links</span>
        </div>

        {loadingLinks ? (
          <div className="space-y-3">
            {[0,1,2].map(i => <div key={i} className="h-14 bg-surface-hover rounded-lg animate-pulse" />)}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">🔗</span>
            <p className="text-slate-400 mt-3 mb-4">No links yet</p>
            <Link to="/shorten" className="btn-primary text-sm">Create your first link</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 border-b border-surface-border text-left">
                  <th className="pb-3 font-medium">Link</th>
                  <th className="pb-3 font-medium">Clicks</th>
                  <th className="pb-3 font-medium hidden sm:table-cell">Created</th>
                  <th className="pb-3 font-medium hidden md:table-cell">Expires</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50">
                {links.map((link) => (
                  <tr key={link._id} className="group hover:bg-surface-hover/40 transition-colors">
                    <td className="py-3.5 pr-4">
                      <div>
                        <div className="text-brand-400 font-mono font-medium">{link.shortCode}</div>
                        <div className="text-slate-500 text-xs truncate max-w-[180px] sm:max-w-[240px]">
                          {link.title || link.originalUrl}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-bold text-white">{link.clicks}</span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-400 hidden sm:table-cell">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 pr-4 hidden md:table-cell">
                      {link.expiresAt ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${new Date() > new Date(link.expiresAt) ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                          {new Date(link.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-xs">Never</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleCopy(link.shortUrl)} title="Copy" className="p-1.5 text-slate-500 hover:text-white rounded hover:bg-surface-hover transition-colors">📋</button>
                        <button onClick={() => handleQr(link._id)} title="QR Code" className="p-1.5 text-slate-500 hover:text-white rounded hover:bg-surface-hover transition-colors">📱</button>
                        <button onClick={() => navigate(`/analytics/${link._id}`)} title="Analytics" className="p-1.5 text-slate-500 hover:text-white rounded hover:bg-surface-hover transition-colors">📊</button>
                        <button
                          onClick={() => handleDelete(link._id)}
                          disabled={deletingId === link._id}
                          title="Delete"
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 transition-colors disabled:opacity-50"
                        >
                          {deletingId === link._id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {qrModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setQrModal(null)}
        >
          <div className="card max-w-sm w-full text-center animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-white mb-1">QR Code</h3>
            <p className="text-slate-400 text-sm mb-5 font-mono">{qrModal.shortUrl}</p>
            <img src={qrModal.qrCode} alt="QR Code" className="mx-auto rounded-lg" />
            <div className="flex gap-3 mt-5">
              <a
                href={qrModal.qrCode}
                download="qr-code.png"
                className="flex-1 btn-primary text-sm"
              >
                Download PNG
              </a>
              <button onClick={() => setQrModal(null)} className="flex-1 btn-ghost text-sm border border-surface-border">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
