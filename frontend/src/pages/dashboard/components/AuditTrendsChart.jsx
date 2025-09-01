import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AuditService from '../../../services/auditService';

const AuditTrendsChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        const response = await AuditService.getAudits();
        
        if (response.success) {
          // Process real audit data to create monthly trends
          const monthlyData = processAuditData(response.audits);
          setChartData(monthlyData);
        }
      } catch (error) {
        console.error('Error loading chart data:', error);
        // Fallback to empty data
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, []);

  const processAuditData = (audits) => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const currentYear = new Date().getFullYear();
    
    // Initialize data for last 7 months
    const monthlyStats = {};
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = months[date.getMonth()];
      
      monthlyStats[monthKey] = {
        month: monthName,
        auditorias: 0,
        completadas: 0
      };
    }

    // Count audits by month
    audits.forEach(audit => {
      const createdDate = new Date(audit.createdAt);
      const monthKey = `${createdDate.getFullYear()}-${createdDate.getMonth()}`;
      
      if (monthlyStats[monthKey]) {
        monthlyStats[monthKey].auditorias++;
        if (audit.status === 'Completada') {
          monthlyStats[monthKey].completadas++;
        }
      }
    });

    return Object.values(monthlyStats);
  };

  return (
    <div className="powerbi-chart">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Tendencias de Auditorías</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-muted-foreground">Iniciadas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-muted-foreground">Completadas</span>
          </div>
        </div>
      </div>
      <div className="w-full h-80" aria-label="Gráfico de Tendencias de Auditorías">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Cargando datos...</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="month" 
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
            <Line 
              type="monotone" 
              dataKey="auditorias" 
              stroke="#2563EB" 
              strokeWidth={2}
              dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
            />
            <Line 
              dataKey="completadas" 
              stroke="#059669" 
              strokeWidth={2}
              dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
            />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AuditTrendsChart;