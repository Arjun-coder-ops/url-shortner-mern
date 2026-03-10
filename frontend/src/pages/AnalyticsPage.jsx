import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { Line } from 'react-chartjs-2';
import api from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

const AnalyticsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qr, setQr] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/url/analytics/${id}`);
        setData(res.data);
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleQr = async () => {
    try {
      const { data: d } = await api.get(`/url/qr/${id}`);
      setQr(d);
    } catch {
      toast.error('QR generation failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <p className="text-slate-400">Link not found.</p>;

  const { url, chartData } = data;

  const lineData = {
    labels: chartData.map((d) =>
      new Date(d.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
    ),
    datasets: [
      {
        label: 'Clicks',
        data: chartData.map((d) => d.clicks),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99,102,241,0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
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
      x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 11 } } },
      y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 11 }, stepSize: 1 }, beginAtZero: true },
    },
  };

  const isExpired = url.expiresAt && new Date() > new Date(url.expiresAt);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      {/* Back */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                isExpired ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : !url.isActive ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                : 'bg-green-500/10 text-green-400 border-green-500/20'
              }`}>
                {isExpired ? 'Expired' : !url.isActive ? 'Inactive' : 'Active'}
              </span>
              {url.title && <span className="text-slate-300 font-semibold">{url.title}</span>}
            </div>
            <a
              href={url.shortUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 font-mono text-lg hover:text-brand-300 transition-colors"
            >
              {url.shortUrl}
            </a>
            <p className="text-slate-500 text-sm mt-1 truncate">{url.originalUrl}</p>
          </div>
          <button
            onClick={handleQr}
            className="btn-ghost text-sm border border-surface-border shrink-0"
          >
            📱 QR Code
          </button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Clicks', value: url.clicks, icon: '👆' },
          { label: 'Created', value: new Date(url.createdAt).toLocaleDateString(), icon: '📅' },
          { label: 'Expires', value: url.expiresAt ? new Date(url.expiresAt).toLocaleDateString() : 'Never', icon: '⏰' },
          { label: 'Clicks (30d)', value: chartData.reduce((s, d) => s + d.clicks, 0), icon: '📈' },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <div className="text-xl">{s.icon}</div>
            <div className="text-xl font-extrabold text-white">{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card mb-6">
        <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-5">
          Clicks over the last 30 days
        </h2>
        <Line data={lineData} options={chartOptions} height={90} />
      </div>

      {/* Recent clicks */}
      {url.clickHistory?.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-white text-sm uppercase tracking-wider mb-4">
            Recent activity
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...url.clickHistory].reverse().slice(0, 50).map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs text-slate-400 py-2 border-b border-surface-border/40 last:border-0">
                <span>{new Date(c.timestamp).toLocaleString()}</span>
                <span className="text-slate-600 hidden sm:block truncate max-w-[200px]">{c.referrer || 'Direct'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qr && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setQr(null)}>
          <div className="card max-w-sm w-full text-center animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-white mb-1">QR Code</h3>
            <p className="text-slate-400 text-sm mb-5 font-mono">{qr.shortUrl}</p>
            <img src={qr.qrCode} alt="QR" className="mx-auto rounded-lg" />
            <div className="flex gap-3 mt-5">
              <a href={qr.qrCode} download="qr-code.png" className="flex-1 btn-primary text-sm">Download</a>
              <button onClick={() => setQr(null)} className="flex-1 btn-ghost text-sm border border-surface-border">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
