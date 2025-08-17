import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AuditTrendsChart = () => {
  const data = [
    { month: 'Ene', auditorias: 45, completadas: 42 },
    { month: 'Feb', auditorias: 52, completadas: 48 },
    { month: 'Mar', auditorias: 48, completadas: 45 },
    { month: 'Abr', auditorias: 61, completadas: 58 },
    { month: 'May', auditorias: 55, completadas: 52 },
    { month: 'Jun', auditorias: 67, completadas: 63 },
    { month: 'Jul', auditorias: 58, completadas: 55 }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-minimal">
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
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
              type="monotone" 
              dataKey="completadas" 
              stroke="#059669" 
              strokeWidth={2}
              dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AuditTrendsChart;