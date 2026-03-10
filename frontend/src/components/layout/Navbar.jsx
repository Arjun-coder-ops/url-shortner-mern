import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-border bg-surface/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🔗</span>
            <span className="text-xl font-extrabold text-white tracking-tight group-hover:text-brand-400 transition-colors">
              Lynkr
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`btn-ghost text-sm ${isActive('/dashboard') ? 'text-white bg-surface-hover' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/shorten"
                  className={`btn-ghost text-sm ${isActive('/shorten') ? 'text-white bg-surface-hover' : ''}`}
                >
                  New Link
                </Link>
                <div className="flex items-center gap-3 ml-3 pl-3 border-l border-surface-border">
                  <span className="text-sm text-slate-400 hidden sm:block">
                    {user?.name}
                  </span>
                  <button onClick={handleLogout} className="btn-ghost text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm">Get started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
