import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Footer from '../../components/ui/Footer';
import MetricCard from './components/MetricCard';
import AuditTrendsChart from './components/AuditTrendsChart';
import ComplianceChart from './components/ComplianceChart';
import LocationComplianceChart from './components/LocationComplianceChart';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import Icon from '../../components/AppIcon';
import AuditorWorkspace from './components/AuditorWorkspace';
import AuditMetrics from './components/AuditMetrics';
import AuditService from '../../services/auditService';
import HeroSection from './components/HeroSection';

const Dashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [auditStats, setAuditStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
    inReview: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'es';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => {
    const loadAuditStats = async () => {
      try {
        setLoading(true);
        const response = await AuditService.getAuditStats();
        if (response.success) {
          setAuditStats(response.stats);
        }
      } catch (error) {
        console.error('Error loading audit stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAuditStats();
  }, []);

  const metrics = [
    {
      title: 'Auditorías Activas',
      value: loading ? '...' : auditStats.active.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: 'Activity',
      iconColor: 'bg-primary'
    },
    {
      title: 'Completadas',
      value: loading ? '...' : auditStats.completed.toString(),
      change: '+8%',
      changeType: 'positive',
      icon: 'CheckCircle',
      iconColor: 'bg-success'
    },
    {
      title: 'Pendientes',
      value: loading ? '...' : auditStats.pending.toString(),
      change: '-5%',
      changeType: 'negative',
      icon: 'Clock',
      iconColor: 'bg-warning'
    },
    {
      title: 'Total de Auditorías',
      value: loading ? '...' : auditStats.total.toString(),
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
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
        <Header />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Hero Section */}
            <HeroSection />



            {/* Auditor-Specific Metrics */}
            <AuditMetrics />

            {/* Auditor Workspace - Main Content */}
            <div className="mb-8">
              <AuditorWorkspace />
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AuditTrendsChart />
              <LocationComplianceChart />
            </div>

          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;