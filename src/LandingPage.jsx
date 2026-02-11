import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/background.png')" }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="bg-black/26 border-b border-[#6f6f6f]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/images/logo.png"
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

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-poppins font-medium text-5xl leading-none mb-3">
              <span className="text-[#FF0000]">Detect.</span>{' '}
              <span className="text-white">Alert.</span>
              <br />
              <span className="text-white">Intervene.</span>
            </h1>

            <p className="text-white/70 font-inter text-lg leading-snug mb-6 max-w-2xl mx-auto">
              Automated monitoring and alerts for
              <br />
              poultry litter management.
            </p>

            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 rounded-full text-white font-inter font-medium text-sm bg-gradient-radial from-[#FF0000] to-[#883636] hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingPage;