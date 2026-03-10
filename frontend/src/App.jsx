import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ShortenPage from './pages/ShortenPage';
import AnalyticsPage from './pages/AnalyticsPage';

const Layout = ({ children }) => (
  <div className="min-h-screen bg-surface">
    <Navbar />
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#e2e8f0',
              border: '1px solid #334155',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
            },
            success: { iconTheme: { primary: '#6366f1', secondary: '#e2e8f0' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route
            path="/dashboard"
            element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
          />
          <Route
            path="/shorten"
            element={<ProtectedRoute><Layout><ShortenPage /></Layout></ProtectedRoute>}
          />
          <Route
            path="/analytics/:id"
            element={<ProtectedRoute><Layout><AnalyticsPage /></Layout></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
