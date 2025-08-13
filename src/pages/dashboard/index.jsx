import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import MetricCard from './components/MetricCard';
import AuditTrendsChart from './components/AuditTrendsChart';
import ComplianceChart from './components/ComplianceChart';
import LocationComplianceChart from './components/LocationComplianceChart';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import Icon from '../../components/AppIcon';

const Dashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'es';
    setCurrentLanguage(savedLanguage);
  }, []);

  const metrics = [
    {
      title: 'Auditorías Activas',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: 'Activity',
      iconColor: 'bg-primary'
    },
    {
      title: 'Completadas Este Mes',
      value: '156',
      change: '+8%',
      changeType: 'positive',
      icon: 'CheckCircle',
      iconColor: 'bg-success'
    },
    {
      title: 'Revisiones Pendientes',
      value: '18',
      change: '-5%',
      changeType: 'negative',
      icon: 'Clock',
      iconColor: 'bg-warning'
    },
    {
      title: 'Puntuación de Cumplimiento',
      value: '94%',
      change: '+2%',
      changeType: 'positive',
      icon: 'Shield',
      iconColor: 'bg-accent'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - AudiconFlow</title>
        <meta name="description" content="Panel de control central para gestión de auditorías retail" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
                  <p className="text-muted-foreground mt-2">
                    Bienvenido al centro de control de auditorías
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Icon name="Calendar" size={16} />
                  <span>Última actualización: {new Date().toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  change={metric.change}
                  changeType={metric.changeType}
                  icon={metric.icon}
                  iconColor={metric.iconColor}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Charts */}
              <div className="lg:col-span-2 space-y-8">
                <AuditTrendsChart />
                <LocationComplianceChart />
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-8">
                <QuickActions />
                <UpcomingDeadlines />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <ComplianceChart />
              <ActivityFeed />
            </div>

            {/* Search and Filter Section */}
            <div className="mt-8 bg-card rounded-lg border border-border p-6 shadow-minimal">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Búsqueda Rápida</h3>
                <Icon name="Search" size={20} className="text-muted-foreground" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar auditorías..."
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="relative">
                  <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <select className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                    <option value="">Todas las ubicaciones</option>
                    <option value="centro">Centro</option>
                    <option value="norte">Norte</option>
                    <option value="sur">Sur</option>
                    <option value="este">Este</option>
                    <option value="oeste">Oeste</option>
                  </select>
                </div>
                <div className="relative">
                  <Icon name="Filter" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <select className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring appearance-none">
                    <option value="">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="completed">Completadas</option>
                    <option value="pending">Pendientes</option>
                    <option value="scheduled">Programadas</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;