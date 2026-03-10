import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '⚡', title: 'Instant Shortening', desc: 'Generate short links in milliseconds with our powerful backend.' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Track every click with detailed charts and geographic data.' },
  { icon: '🎨', title: 'Custom Aliases', desc: 'Create branded links with your own custom short codes.' },
  { icon: '📱', title: 'QR Code Generator', desc: 'Auto-generate QR codes for any shortened link instantly.' },
  { icon: '⏰', title: 'Link Expiration', desc: 'Set expiry dates so links automatically deactivate.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'JWT auth and bcrypt hashing keep your account safe.' },
];

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="text-center py-20 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-8 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse-slow" />
          Smart URL Management
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6">
          Shorten. Share.{' '}
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Analyze.
          </span>
        </h1>

        <p className="text-lg text-slate-400 mb-10 leading-relaxed">
          Transform long URLs into powerful trackable links. Monitor every click,
          build custom aliases, and get the analytics you need — all in one place.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary px-8 py-3 text-base">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn-primary px-8 py-3 text-base">
                Start for free →
              </Link>
              <Link to="/login" className="btn-ghost px-8 py-3 text-base text-slate-300">
                Sign in
              </Link>
            </>
          )}
        </div>

        {/* Fake URL demo visual */}
        <div className="mt-16 card text-left max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-surface rounded-lg px-4 py-3 text-slate-500 text-sm font-mono truncate">
              https://very-long-website.com/this/is/a/really/long/path?with=query&params=true
            </div>
            <button className="btn-primary shrink-0 text-sm">Shorten →</button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-slate-500 text-sm">Result:</span>
            <span className="text-brand-400 font-mono text-sm font-medium">
              localhost:5000/xK7p2qR
            </span>
            <span className="ml-auto text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-full">
              ✓ Copied
            </span>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="pb-20">
        <h2 className="text-center text-2xl font-bold text-white mb-2">
          Everything you need
        </h2>
        <p className="text-center text-slate-400 mb-10 text-sm">
          A complete toolkit for managing and understanding your links.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card hover:border-brand-500/40 transition-all duration-200 hover:-translate-y-0.5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-white mb-1">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
