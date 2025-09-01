import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import AuditService from '../../../services/auditService';

const AuditMetrics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await AuditService.getAuditStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading audit stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const metrics = stats ? [
    {
      title: 'Progreso',
      value: stats.active || 0,
      change: '+' + (stats.active > 0 ? Math.floor(stats.active * 0.2) : 0),
      changeType: 'positive',
      icon: 'FileCheck',
      iconColor: 'bg-blue-500',
      description: 'En proceso'
    },
    {
      title: 'Completadas',
      value: stats.completed || 0,
      change: '+' + (stats.completed > 0 ? Math.floor(stats.completed * 0.15) : 0),
      changeType: 'positive',
      icon: 'CheckCircle',
      iconColor: 'bg-green-500',
      description: 'Finalizadas este mes'
    },
    {
      title: 'Pendientes',
      value: stats.pending || 0,
      change: stats.pending > 0 ? '-1' : '0',
      changeType: 'positive',
      icon: 'Clock',
      iconColor: 'bg-orange-500',
      description: 'Por iniciar'
    },
    {
      title: 'Compliance Rate',
      value: stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) + '%' : '0%',
      change: '+1.2%',
      changeType: 'positive',
      icon: 'Shield',
      iconColor: 'bg-purple-500',
      description: 'Promedio mensual'
    }
  ] : [];

  const getChangeColor = (changeType) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = (changeType) => {
    switch (changeType) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="powerbi-metric animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="powerbi-metric">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg ${metric.iconColor}`}>
              <Icon name={metric.icon} size={20} color="white" />
            </div>
            <div className={`flex items-center space-x-1 ${getChangeColor(metric.changeType)}`}>
              <Icon name={getChangeIcon(metric.changeType)} size={14} />
              <span className="text-sm font-medium">{metric.change}</span>
            </div>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-foreground mb-1">{metric.value}</p>
            <p className="text-sm font-medium text-foreground">{metric.title}</p>
            <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuditMetrics;
