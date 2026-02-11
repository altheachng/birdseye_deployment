import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [wetPercentage, setWetPercentage] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
     
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
      
     
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          alert('Please login first');
          navigate('/login');
          return;
        }
        
        const response = await fetch('https://api.birdseye.work/imageprocessing/manualupload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        });
        
        if (response.status === 401) {
          // Token expired or invalid
          alert('Session expired. Please login again.');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userEmail');
          navigate('/login');
          return;
        }
        
        const data = await response.json();
        
        if (data.success || response.ok) {
          setProcessedImage(data.processed_image);
          setWetPercentage(data.wet_percentage);
        } else {
          console.error('Analysis failed:', data.error);
          alert('Analysis failed: ' + (data.error || data.detail));
        }
      } catch (error) {
        console.error('Error sending image:', error);
        alert('Error connecting to server. Please try again.');
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <motion.div 
      className="h-screen flex overflow-hidden bg-[#F5EFE7]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
    >
      {/* Sidebar */}
      <div className="w-56 bg-[#AC4242] flex flex-col">
        <div className="p-6 flex justify-center">
          <img 
            src="/images/logonav.png"
            alt="Birdseye Logo" 
            className="h-32 w-auto"
          />
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <a 
            href="#dashboard" 
            className="flex items-center gap-3 px-4 py-3 text-white bg-white/20 rounded-lg font-inter text-sm transition-all duration-300 hover:bg-white/30 hover:scale-105"
          >
            <img src="/images/dashboard.png" alt="" className="h-5 w-5" />
            Dashboard
          </a>
          <a 
            href="#cameras" 
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg font-inter text-sm transition-all duration-300 hover:scale-105"
          >
            <img src="/images/cameras.png" alt="" className="h-5 w-5" />
            Cameras
          </a>
          <a 
            href="#history" 
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg font-inter text-sm transition-all duration-300 hover:scale-105"
          >
            <img src="/images/history.png" alt="" className="h-5 w-5" />
            History
          </a>
          <a 
            href="#profile" 
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg font-inter text-sm transition-all duration-300 hover:scale-105"
          >
            <img src="/images/profile.png" alt="" className="h-5 w-5" />
            Profile
          </a>
          <a 
            href="#settings" 
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 rounded-lg font-inter text-sm transition-all duration-300 hover:scale-105"
          >
            <img src="/images/settings.png" alt="" className="h-5 w-5" />
            Settings
          </a>
        </nav>

        {/* Logout Button */}
        <div className="px-4 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-white hover:bg-white/10 rounded-lg font-inter text-sm transition-all duration-300 hover:scale-105"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <nav className="bg-[#F5EFE7] border-b border-gray-300">
          <div className="px-6 py-4 flex items-center justify-between">
            <img 
              src="/images/loginlogo.png"
              alt="Birdseye" 
              className="h-12 w-auto"
            />
            <div className="text-sm font-inter text-gray-600">
              {localStorage.getItem('userEmail')}
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <h1 className="text-5xl font-poppins font-semibold text-[#AC4242] mb-8">
            Dashboard
          </h1>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Live Camera Feed / Image Upload */}
            <div className="col-span-2 bg-white rounded-3xl shadow-lg p-6 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gray-50">
              <h2 className="text-2xl font-poppins font-semibold mb-4">
                Upload Image
              </h2>
              
              <div className="relative bg-gray-100 rounded-xl overflow-hidden aspect-video">
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
                    <div className="text-white text-xl font-inter">Analyzing...</div>
                  </div>
                )}
                
                {processedImage || uploadedImage ? (
                  <img 
                    src={processedImage || uploadedImage} 
                    alt="Uploaded" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <label className="cursor-pointer flex flex-col items-center">
                      <svg className="w-16 h-16 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-gray-500 font-inter">Click to upload image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
                
                {processedImage && (
                  <div className="absolute top-4 left-4 bg-[#AC4242] text-white px-4 py-2 rounded-lg font-inter text-sm">
                    Zone 1
                  </div>
                )}
                
                {processedImage && wetPercentage > 0 && (
                  <div className="absolute bottom-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full font-inter text-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    Wet litter detected
                  </div>
                )}
              </div>
            </div>

            {/* Right Side Cards */}
            <div className="space-y-6">
              {/* Chicken Count */}
              <div className="bg-white rounded-3xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:bg-gray-50">
                <h3 className="text-lg font-poppins font-semibold mb-2">
                  Chicken Count
                </h3>
                <p className="text-6xl font-poppins font-bold text-gray-800">
                  0
                </p>
                <p className="text-sm font-inter text-gray-600 mt-1">chickens counted</p>
              </div>

              {/* Wet Litter Percentage */}
              <div
                className={`rounded-3xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  wetPercentage <= 25
                    ? 'bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200'
                    : wetPercentage <= 35
                    ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200'
                    : 'bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200'
                }`}
              >
                <h3 className="text-lg font-poppins font-semibold mb-2">
                  Wet Litter Percentage
                </h3>

                <p className="text-6xl font-poppins font-bold text-gray-800">
                  {wetPercentage.toFixed(1)}%
                </p>

                {wetPercentage > 0 && (
                  <p className="text-sm font-inter text-gray-600 mt-1">
                    wet litter detected —{' '}
                    <span
                      className={`font-semibold ${
                        wetPercentage <= 25
                          ? 'text-green-600'
                          : wetPercentage <= 35
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {wetPercentage <= 25
                        ? 'Safe'
                        : wetPercentage <= 35
                        ? 'Moderate'
                        : 'Critical'}
                    </span>
                  </p>
                )}
              </div>

              {/* Ammonia Level */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl shadow-lg p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:from-green-100 hover:to-green-200">
                <h3 className="text-lg font-poppins font-semibold mb-2">
                  Ammonia Level
                </h3>
                <p className="text-6xl font-poppins font-bold text-gray-800">
                  0<span className="text-3xl">ppm</span>
                </p>
              </div>
            </div>
          </div>

          {/* Suggested Interventions */}
          <div className="mb-8">
            <h2 className="text-3xl font-poppins font-semibold mb-4">
              Suggested Interventions
            </h2>
            
            {processedImage && wetPercentage > 15 ? (
              <div className="space-y-4">
                {/* Intervention Card */}
                <div className="bg-white rounded-3xl shadow-lg p-6 flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
                  <div className="bg-[#D4A5A5] rounded-3xl p-6 flex-shrink-0">
                    <img 
                      src="/images/FAN.png" 
                      alt="Fan" 
                      className="w-12 h-12"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-poppins font-semibold mb-1">
                      Increase ventilation in Zone 1
                    </h3>
                    <p className="text-base font-inter text-gray-700">
                      High moisture is detected in Zone 1.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
                <p className="text-gray-600 font-inter text-lg">
                  {processedImage 
                    ? 'No interventions needed. Litter conditions are good.'
                    : 'Upload an image to get intervention suggestions.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;