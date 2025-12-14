import React, { useState } from 'react';
import { User, Lock, Workflow } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import loginBackground from '@/assets/login-background.jpg';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const envUsername = import.meta.env.VITE_APP_USERNAME;
    const envPassword = import.meta.env.VITE_APP_PASSWORD;

    if (username === envUsername && password === envPassword) {
      const expiryTime = rememberMe
        ? Date.now() + 24 * 60 * 60 * 1000   // 1 day
        : Date.now() + 5 * 60 * 1000;        // 5 minutes

      localStorage.setItem(
        'LOGI_FLOW_SESSION',
        JSON.stringify({
          id: crypto.randomUUID(),
          expiresAt: expiryTime,
          rememberMe
        })
      );

      onLogin();
      navigate('/search');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 w-full max-w-sm p-8 bg-white rounded-2xl shadow-xl space-y-6">
        <div className="text-center">
          <div className="flex justify-center items-center space-x-2 mb-2">
            <Workflow size={28} />
            <h1 className="text-2xl font-bold">LOGI FLOW</h1>
          </div>
          <h2 className="text-xl font-semibold">Sign In</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400" />
            <input
              className="w-full pl-10 py-2 border rounded-lg"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              className="w-full pl-10 py-2 border rounded-lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span className="text-sm">Remember me (1 day)</span>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="w-full py-2 bg-blue-600 text-white rounded-lg">
            Login
          </button>
        </form>

        <div className="text-center text-sm">
          <Link to="/forgot-password" className="text-blue-600">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
