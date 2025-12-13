
import React, { useState } from 'react';
import { User, Lock,  Workflow } from 'lucide-react';
//import { useNavigate } from 'react-router-dom';
import loginBackground from '@/assets/login-background.jpg';
import { useNavigate, Link } from 'react-router-dom';
interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  //const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'password') {
      setError('');
      onLogin();
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
  
      {/* Login Card */}
      <div className="
        relative z-10 
        w-full max-w-sm 
        p-8 
        bg-white 
        shadow-xl 
        rounded-2xl 
        backdrop-blur-lg
        space-y-6
      ">
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-400 rounded-lg flex items-center justify-center text-white shadow-md">
              <Workflow size={28} />
            </div>
            <div className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
              LOGI FLOW
            </div>
          </div>
  
          <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        </div>
  
        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2 
                border rounded-lg 
                text-gray-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
  
          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2 
                border rounded-lg 
                text-gray-700 
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>
  
          {/* Remember Me */}
          <div className="text-right">
                    <Link to="/forgot-password" className="text-sm font-medium text-blue-600 hover:underline">
                        Forgot Password?
                    </Link>
                </div>
  
          {/* Error */}
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
  
          {/* Login Button */}
          <button
            type="submit"
            className="
              w-full py-2.5 
              font-medium text-white 
              bg-blue-600 rounded-lg 
              hover:bg-blue-700 
              transition 
              shadow-md
            "
          >
            Log In
          </button>
        </form>
  
        {/* Footer */}
        <div className="text-center pt-2">
        <Link to="/create-account" className="font-medium text-gray-700 underline underline-offset-4 hover:text-blue-600 text-sm">
                    Create an account
                </Link>
        </div>
      </div>
    </div>
  );
  
};

export default LoginPage;
