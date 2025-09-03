import React from 'react';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  return (
    <div className="relative mb-12 rounded-2xl overflow-hidden shadow-2xl">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/images/12.png" 
          alt="AudiconFlow - Gestión de Auditorías"
          className="w-full h-80 object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/90 via-purple-900/80 to-indigo-900/90"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-20 flex items-center justify-between px-12 h-80">
        <div className="text-white">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-lg">Dashboard</h1>
          <p className="text-xl text-white/90 mb-6 max-w-2xl leading-relaxed">
            Centro de control integral para la gestión profesional de auditorías
          </p>
          <div className="flex items-center space-x-6 text-white/80">
            <div className="flex items-center space-x-2">
              <Icon name="Calendar" size={18} className="text-white/90" />
              <span className="text-sm">Última actualización: {new Date().toLocaleDateString('es-ES', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="User" size={18} className="text-white/90" />
              <span className="text-sm">Usuario: {(() => {
                const session = localStorage.getItem('audiconflow_session');
                if (session) {
                  const sessionData = JSON.parse(session);
                  return sessionData.name || sessionData.email || 'Usuario Anónimo';
                }
                return 'Usuario Anónimo';
              })()}</span>
            </div>
          </div>
        </div>
        
        {/* Right Side Icon */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 border border-white/20">
            <Icon name="Shield" size={48} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;