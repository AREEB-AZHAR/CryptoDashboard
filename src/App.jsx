import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from './pages/LoginPage';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import Trade from './pages/Trade';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import News from './pages/News';
import Settings from './pages/Settings';
import CoinDetail from './pages/CoinDetail';

const queryClient = new QueryClient();

// Route wrapper to require login and remember the requested path
const ProtectedRoute = ({ user, children }) => {
  const location = useLocation();
  if (!user) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

// Route wrapper for Login so we can redirect them back to where they came from
const LoginWrapper = ({ user, onLogin }) => {
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  if (user) {
    return <Navigate to={from} replace />;
  }
  return <LoginPage onLogin={onLogin} />;
};

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('crypto_auth');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Check if the current time is less than the expiry time
      if (new Date().getTime() < parsed.expiry) {
        return parsed.user;
      }
      // Token expired
      localStorage.removeItem('crypto_auth');
    }
    return null;
  });

  const handleLogin = (userData) => {
    // Set expiry for 30 minutes from now
    const expiry = new Date().getTime() + 30 * 60 * 1000;
    localStorage.setItem('crypto_auth', JSON.stringify({ user: userData, expiry }));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('crypto_auth');
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route 
            path="/login" 
            element={<LoginWrapper user={user} onLogin={handleLogin} />} 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute user={user}>
                <Layout user={user} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="markets" element={<Markets />} />
            <Route path="coin/:id" element={<CoinDetail />} />
            <Route path="trade" element={<Trade />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="news" element={<News />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
