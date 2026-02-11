import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // OAuth2 requires form data, not JSON
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('https://api.birdseye.work/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful - store the token
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('userEmail', username);
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Handle different error formats and status codes
        let errorMessage = 'Login failed. Please check your credentials.';
        
        // Check for specific HTTP status codes
        if (response.status === 404) {
          errorMessage = 'Account not found. Please check your username/email.';
        } else if (response.status === 401) {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (response.status === 400) {
          errorMessage = 'Invalid login credentials.';
        } else if (typeof data.detail === 'string') {
          // Check if detail contains common error messages
          const detailLower = data.detail.toLowerCase();
          if (detailLower.includes('not found') || detailLower.includes('does not exist')) {
            errorMessage = 'Account not found. Please check your username/email.';
          } else if (detailLower.includes('incorrect') || detailLower.includes('invalid password')) {
            errorMessage = 'Incorrect password. Please try again.';
          } else {
            errorMessage = data.detail;
          }
        } else if (Array.isArray(data.detail)) {
          // FastAPI validation errors return an array
          errorMessage = data.detail.map(err => err.msg).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Error connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="h-screen relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background2.png')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-black/26 border-b border-[#6f6f6f]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo2.png"
                alt="Birdseye Logo" 
                className="h-12 w-auto"
              />
              <img 
                src="/images/logo-text.png"
                alt="Birdseye" 
                className="h-14 w-auto"
              />
            </div>

            <div className="flex items-center gap-8">
              <a 
                href="#features" 
                className="text-white font-inter text-sm hover:text-white/80 transition-colors"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-white font-inter text-sm hover:text-white/80 transition-colors"
              >
                How it works
              </a>
            </div>
          </div>
        </nav>

        {/* Login Card */}
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div 
            className="bg-[#F5EFE7] rounded-3xl p-10 w-full max-w-md shadow-2xl transform transition-all duration-500 hover:scale-105"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Logo in Card */}
            <div className="flex flex-col items-center mb-6">
              <img 
                src="/images/loginlogo.png"
                alt="Birdseye Logo" 
                className="h-32 w-auto"
              />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#C4A574] bg-transparent placeholder-[#8B7355] text-gray-800 focus:outline-none focus:border-[#AC4242] transition-all duration-300"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-[#C4A574] bg-transparent placeholder-[#8B7355] text-gray-800 focus:outline-none focus:border-[#AC4242] transition-all duration-300"
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="text-left">
                <a 
                  href="#forgot-password" 
                  className="text-[#AC4242] text-sm font-inter hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-[#AC4242] text-white font-poppins font-medium text-base hover:bg-[#8B3434] transition-all duration-300 transform hover:scale-105 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginPage;