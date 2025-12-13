
import React, { useState } from 'react';
import { User, Mail, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import loginBackground from '@/assets/login-background.jpg';

const ForgotPassword = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would handle the password reset logic here.
    setMessage(`Password reset link sent to ${email}`);
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBackground})` }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 w-full max-w-sm p-8 space-y-8 bg-white shadow-2xl rounded-2xl">
        <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-6 space-x-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-400 rounded-lg flex items-center justify-center text-white shadow-md">
                    <Workflow size={28} />
                </div>
                <div className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">
                    LOGI FLOW
                </div>
            </div>

            <h2 className="mb-4 text-3xl font-bold">Forgot Password</h2>
        </div>
      
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                  type="text"
                  placeholder="Your Name"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {message && <p className="text-sm text-green-600 text-center">{message}</p>}

            <button
              type="submit"
              className="w-full py-3 font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg"
            >
              Reset Password
            </button>
        </form>

        <div className="text-center">
            <Link to="/login" className="font-medium text-gray-700 underline underline-offset-4 hover:text-blue-600 text-sm">
                Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
