import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import BackgroundOverlay from './components/BackgroundOverlay';
import SecurityBadge from './components/SecurityBadge';

const LoginScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const existingSession = localStorage.getItem('audiconflow_session');
    if (existingSession) {
      try {
        const sessionData = JSON.parse(existingSession);
        const loginTime = new Date(sessionData.loginTime);
        const currentTime = new Date();
        const timeDifference = currentTime - loginTime;
        const hoursDifference = timeDifference / (1000 * 60 * 60);
        
        // If session is less than 24 hours old, redirect to dashboard
        if (hoursDifference < 24) {
          navigate('/dashboard');
        } else {
          // Clear expired session
          localStorage.removeItem('audiconflow_session');
        }
      } catch (error) {
        // Clear invalid session data
        localStorage.removeItem('audiconflow_session');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background">
      {/* Background with Overlay */}
      <BackgroundOverlay />
      
      {/* Main Content */}
      <div className="relative z-20 w-full max-w-md">
        <LoginForm />
      </div>
      
      {/* Security Badge */}
      <SecurityBadge />
      
      {/* Mobile Responsive Adjustments */}
      <style>{`
        @media (max-width: 640px) {
          .min-h-screen {
            padding: 1rem;
          }
        }
        
        @media (max-width: 480px) {
          .min-h-screen {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;