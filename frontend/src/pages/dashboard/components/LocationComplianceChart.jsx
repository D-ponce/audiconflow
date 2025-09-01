import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AuditService from '../../../services/auditService';

const LocationComplianceChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        const response = await AuditService.getAudits();
        
        if (response.success) {
          const locationData = processLocationData(response.audits);
          setChartData(locationData);
        }
      } catch (error) {
        console.error('Error loading location data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  const processLocationData = (audits) => {
    const locationStats = {};

    // Count audits by location
    audits.forEach(audit => {
      const location = audit.location || 'Sin ubicación';
      
      if (!locationStats[location]) {
        locationStats[location] = {
          location: location,
          completadas: 0,
          pendientes: 0
        };
      }

      if (audit.status === 'Completada') {
        locationStats[location].completadas++;
      } else {
        locationStats[location].pendientes++;
      }
    });

    return Object.values(locationStats);
  };

  return (
    <div className="powerbi-chart">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Cumplimiento por Ubicación</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-muted-foreground">Completadas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span className="text-muted-foreground">Pendientes</span>
          </div>
        </div>
      </div>
      <div className="w-full h-80" aria-label="Gráfico de Cumplimiento por Ubicación">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Cargando datos...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="location" 
              stroke="#64748B"
              fontSize={12}
            />
            <YAxis 
              stroke="#64748B"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar 
              dataKey="completadas" 
              stackId="a" 
              fill="#059669"
              radius={[0, 0, 4, 4]}
            />
            <Bar 
              dataKey="pendientes" 
              stackId="a" 
              fill="#D97706"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LocationComplianceChart;