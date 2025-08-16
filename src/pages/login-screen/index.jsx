import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import BackgroundOverlay from './components/BackgroundOverlay';
import SecurityBadge from './components/SecurityBadge';

const LoginScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const existingSession = localStorage.getItem('audiconflow_session');
    if (existingSession) {
      try {
        const sessionData = JSON.parse(existingSession);
        const loginTime = new Date(sessionData.loginTime);
        const currentTime = new Date();
        const timeDifference = currentTime - loginTime;
        const hoursDifference = timeDifference / (1000 * 60 * 60);

        if (hoursDifference < 24) {
          navigate('/dashboard');
        } else {
          localStorage.removeItem('audiconflow_session');
        }
      } catch (error) {
        localStorage.removeItem('audiconflow_session');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-background">
      <BackgroundOverlay />
      <div className="relative z-20 w-full max-w-md">
        <LoginForm />
      </div>
      <SecurityBadge />
    </div>
  );
};

export default LoginScreen;
