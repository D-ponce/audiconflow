import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const VisualizationArea = ({ reportData, reportType }) => {
  const [chartType, setChartType] = useState('bar');
  const [selectedMetric, setSelectedMetric] = useState(reportType === 'cross-check' ? 'cross-results' : 'compliance');

  const complianceData = [
    { month: 'Ene', cumplimiento: 85, objetivo: 90, auditorias: 45 },
    { month: 'Feb', cumplimiento: 88, objetivo: 90, auditorias: 52 },
    { month: 'Mar', cumplimiento: 92, objetivo: 90, auditorias: 48 },
    { month: 'Abr', cumplimiento: 87, objetivo: 90, auditorias: 55 },
    { month: 'May', cumplimiento: 94, objetivo: 90, auditorias: 61 },
    { month: 'Jun', cumplimiento: 91, objetivo: 90, auditorias: 58 },
    { month: 'Jul', cumplimiento: 89, objetivo: 90, auditorias: 63 }
  ];

  const performanceData = [
    { auditor: 'María García', auditorias: 28, promedio: 4.8, eficiencia: 95 },
    { auditor: 'Carlos López', auditorias: 32, promedio: 4.6, eficiencia: 88 },
    { auditor: 'Ana Martín', auditorias: 25, promedio: 4.9, eficiencia: 97 },
    { auditor: 'José Ruiz', auditorias: 30, promedio: 4.4, eficiencia: 85 },
    { auditor: 'Laura Sánchez', auditorias: 27, promedio: 4.7, eficiencia: 92 }
  ];

  const locationData = [
    { name: 'Casa Matriz', value: 35, color: '#2563EB' },
    { name: 'Centro de distribución S', value: 28, color: '#059669' },
    { name: 'Centro de Distribución P', value: 22, color: '#D97706' },
    { name: 'Locales', value: 18, color: '#7C3AED' },
    { name: 'Tiendas', value: 15, color: '#DC2626' }
  ];

  const trendData = [
    { week: 'Sem 1', incidencias: 12, resueltas: 10, pendientes: 2 },
    { week: 'Sem 2', incidencias: 8, resueltas: 7, pendientes: 1 },
    { week: 'Sem 3', incidencias: 15, resueltas: 13, pendientes: 2 },
    { week: 'Sem 4', incidencias: 6, resueltas: 6, pendientes: 0 }
  ];

  const chartTypeOptions = [
    { value: 'bar', label: 'Gráfico de Barras' },
    { value: 'line', label: 'Gráfico de Líneas' },
    { value: 'area', label: 'Gráfico de Área' },
    { value: 'pie', label: 'Gráfico Circular' }
  ];

  const metricOptions = reportType === 'cross-check' ? [
    { value: 'cross-results', label: 'Resultados del Cruce' },
    { value: 'compliance', label: 'Cumplimiento' },
    { value: 'performance', label: 'Rendimiento' },
    { value: 'trends', label: 'Tendencias' },
    { value: 'locations', label: 'Ubicaciones' }
  ] : [
    { value: 'compliance', label: 'Cumplimiento' },
    { value: 'performance', label: 'Rendimiento' },
    { value: 'trends', label: 'Tendencias' },
    { value: 'locations', label: 'Ubicaciones' }
  ];

  // Procesar datos del cruce para visualización
  const processCrossData = () => {
    if (!reportData || !reportData.results) return [];
    
    const coincidencias = reportData.results.filter(r => r.resultado === 'hay coincidencia').length;
    const noCoincidencias = reportData.results.filter(r => r.resultado === 'no hay coincidencia').length;
    
    return [
      { name: 'Hay Coincidencia', value: coincidencias, color: '#059669' },
      { name: 'No Hay Coincidencia', value: noCoincidencias, color: '#DC2626' }
    ];
  };

  const getCrossStats = () => {
    if (!reportData || !reportData.results) return { total: 0, coincidencias: 0, porcentaje: 0 };
    
    const total = reportData.results.length;
    const coincidencias = reportData.results.filter(r => r.resultado === 'hay coincidencia').length;
    const porcentaje = total > 0 ? Math.round((coincidencias / total) * 100) : 0;
    
    return { total, coincidencias, porcentaje };
  };

  const renderChart = () => {
    switch (selectedMetric) {
      case 'cross-results':
        const crossData = processCrossData();
        if (chartType === 'pie') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={crossData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {crossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          );
        } else {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={crossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="value" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          );
        }
      case 'compliance':
        if (chartType === 'bar') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="cumplimiento" fill="#2563EB" name="Cumplimiento %" />
                <Bar dataKey="objetivo" fill="#059669" name="Objetivo %" />
              </BarChart>
            </ResponsiveContainer>
          );
        } else if (chartType === 'line') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="cumplimiento" stroke="#2563EB" strokeWidth={3} name="Cumplimiento %" />
                <Line type="monotone" dataKey="objetivo" stroke="#059669" strokeWidth={2} strokeDasharray="5 5" name="Objetivo %" />
              </LineChart>
            </ResponsiveContainer>
          );
        } else if (chartType === 'area') {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-card)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="cumplimiento" stackId="1" stroke="#2563EB" fill="#2563EB" fillOpacity={0.6} name="Cumplimiento %" />
              </AreaChart>
            </ResponsiveContainer>
          );
        }
        break;

      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={performanceData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" stroke="#64748B" />
              <YAxis dataKey="auditor" type="category" stroke="#64748B" width={100} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Bar dataKey="auditorias" fill="#2563EB" name="Auditorías Completadas" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'locations':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="week" stroke="#64748B" />
              <YAxis stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--color-card)', 
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Area type="monotone" dataKey="incidencias" stackId="1" stroke="#DC2626" fill="#DC2626" fillOpacity={0.6} name="Incidencias" />
              <Area type="monotone" dataKey="resueltas" stackId="2" stroke="#059669" fill="#059669" fillOpacity={0.6} name="Resueltas" />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg">
            <Icon name="BarChart3" size={20} color="var(--color-success)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Visualización de Datos</h3>
            <p className="text-sm text-muted-foreground">Análisis interactivo de datos de auditoría</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Select
            options={metricOptions}
            value={selectedMetric}
            onChange={setSelectedMetric}
            placeholder="Seleccionar métrica"
            className="w-48"
          />
          <Select
            options={chartTypeOptions}
            value={chartType}
            onChange={setChartType}
            placeholder="Tipo de gráfico"
            className="w-48"
          />
          <Button variant="outline" size="sm" iconName="Download">
            Exportar
          </Button>
        </div>
      </div>

      <div className="bg-muted/30 rounded-lg p-4">
        {renderChart()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {reportType === 'cross-check' ? (
          <>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{getCrossStats().total}</div>
              <div className="text-sm text-muted-foreground">Total de Registros</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success mb-1">{getCrossStats().coincidencias}</div>
              <div className="text-sm text-muted-foreground">Con Coincidencia</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-warning mb-1">{getCrossStats().total - getCrossStats().coincidencias}</div>
              <div className="text-sm text-muted-foreground">Sin Coincidencia</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">{getCrossStats().porcentaje}%</div>
              <div className="text-sm text-muted-foreground">Porcentaje de Coincidencia</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">94%</div>
              <div className="text-sm text-muted-foreground">Cumplimiento Promedio</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success mb-1">142</div>
              <div className="text-sm text-muted-foreground">Auditorías Completadas</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-warning mb-1">8</div>
              <div className="text-sm text-muted-foreground">Incidencias Pendientes</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent mb-1">4.7</div>
              <div className="text-sm text-muted-foreground">Calificación Promedio</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VisualizationArea;