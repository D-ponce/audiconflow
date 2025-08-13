import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LocationComplianceChart = () => {
  const data = [
    { location: 'Centro', completadas: 85, pendientes: 15 },
    { location: 'Norte', completadas: 92, pendientes: 8 },
    { location: 'Sur', completadas: 78, pendientes: 22 },
    { location: 'Este', completadas: 88, pendientes: 12 },
    { location: 'Oeste', completadas: 95, pendientes: 5 },
    { location: 'Plaza', completadas: 82, pendientes: 18 }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-minimal">
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
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
      </div>
    </div>
  );
};

export default LocationComplianceChart;