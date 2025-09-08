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
    { value: 'pie', label: 'Gráfico Circular' }
  ];

  const metricOptions = reportType === 'cross-check' ? [
    { value: 'cross-results', label: 'Resultados del Cruce' }
  ] : [
    { value: 'cross-results', label: 'Resultados del Cruce' }
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

  const handleExportVisualization = async () => {
    try {
      // Crear datos del reporte de visualización
      const visualizationData = {
        name: `Reporte de Visualización - ${selectedMetric}`,
        createdBy: localStorage.getItem('currentUser') || 'Usuario Anónimo',
        data: {
          chartType: chartType,
          selectedMetric: selectedMetric,
          reportType: reportType,
          crossResults: reportData?.results || [],
          stats: getCrossStats()
        },
        metadata: {
          totalRecords: getCrossStats().total,
          matchedRecords: getCrossStats().coincidencias,
          matchPercentage: getCrossStats().porcentaje,
          chartType: chartType,
          metric: selectedMetric,
          generatedAt: new Date().toISOString()
        }
      };

      // Generar reporte PDF con gráficas
      await generateVisualizationPDF(visualizationData);

      alert('Reporte de visualización exportado exitosamente en PDF');
    } catch (error) {
      console.error('Error al exportar visualización:', error);
      alert('Error al generar el reporte PDF. Intente nuevamente.');
    }
  };

  const generateVisualizationPDF = async (data) => {
    try {
      // Importar jsPDF dinámicamente
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      await import('jspdf-autotable');

      const { stats, chartType, selectedMetric } = data.data;
      const fileName = `reporte_visualizacion_${new Date().toISOString().split('T')[0]}`;
      
      // Crear documento PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configurar fuentes
      doc.setFont('helvetica');
      
      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(data.name, 20, 25);
      
      // Información del reporte
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
      doc.text(`Por: ${data.createdBy}`, 20, 40);
      doc.text(`Tipo de gráfico: ${chartType === 'pie' ? 'Circular' : 'Barras'}`, 20, 45);
      
      let currentY = 60;
      
      // Marca corporativa
      doc.setFontSize(16);
      doc.setTextColor(66, 139, 202);
      doc.text('AudiconFlow', 20, currentY);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Sistema de Gestión de Auditorías - Reporte de Visualización', 20, currentY + 5);
      currentY += 20;
      
      // Capturar gráfica como imagen
      const chartElement = document.querySelector('.recharts-wrapper');
      if (chartElement) {
        try {
          // Usar html2canvas para capturar la gráfica
          const html2canvas = await import('html2canvas');
          const canvas = await html2canvas.default(chartElement, {
            backgroundColor: '#ffffff',
            scale: 2,
            logging: false
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 170;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          doc.setFontSize(14);
          doc.setTextColor(40, 40, 40);
          doc.text('Visualización de Datos', 20, currentY);
          currentY += 10;
          
          doc.addImage(imgData, 'PNG', 20, currentY, imgWidth, imgHeight);
          currentY += imgHeight + 15;
        } catch (error) {
          console.warn('No se pudo capturar la gráfica, generando representación alternativa');
          // Generar representación alternativa de la gráfica
          currentY = generateAlternativeChart(doc, data, currentY);
        }
      } else {
        // Generar representación alternativa si no se encuentra el elemento
        currentY = generateAlternativeChart(doc, data, currentY);
      }
      
      // Resumen de estadísticas
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text('Resumen de Estadísticas', 20, currentY);
      currentY += 10;
      
      if (reportType === 'cross-check') {
        const tableData = [
          ['Total de Registros', stats.total.toString()],
          ['Con Coincidencia', stats.coincidencias.toString()],
          ['Sin Coincidencia', (stats.total - stats.coincidencias).toString()],
          ['Porcentaje de Coincidencia', `${stats.porcentaje}%`]
        ];
        
        doc.autoTable({
          head: [['Métrica', 'Valor']],
          body: tableData,
          startY: currentY,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [66, 139, 202], textColor: 255 },
          margin: { left: 20, right: 20 }
        });
      } else {
        const tableData = [
          ['Cumplimiento Promedio', '94%'],
          ['Auditorías Completadas', '142'],
          ['Incidencias Pendientes', '8'],
          ['Calificación Promedio', '4.7']
        ];
        
        doc.autoTable({
          head: [['Métrica', 'Valor']],
          body: tableData,
          startY: currentY,
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [66, 139, 202], textColor: 255 },
          margin: { left: 20, right: 20 }
        });
      }
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount} - AudiconFlow Visualización`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }
      
      // Descargar PDF
      doc.save(`${fileName}.pdf`);
      
    } catch (error) {
      console.error('Error generando PDF de visualización:', error);
      throw error;
    }
  };

  const generateAlternativeChart = (doc, data, startY) => {
    const { stats, chartType } = data.data;
    
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('Visualización de Datos', 20, startY);
    startY += 10;
    
    if (chartType === 'pie') {
      // Representación alternativa para gráfico circular
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Gráfico Circular - ${selectedMetric}`, 20, startY);
      startY += 10;
      
      if (reportType === 'cross-check') {
        // Dibujar representación simple del gráfico circular
        const centerX = 105;
        const centerY = startY + 30;
        const radius = 25;
        
        // Calcular ángulos
        const matchAngle = (stats.coincidencias / stats.total) * 360;
        
        // Sector de coincidencias (verde)
        doc.setFillColor(76, 175, 80);
        doc.circle(centerX, centerY, radius, 'F');
        
        // Sector sin coincidencias (rojo) - simplificado como rectángulo
        if (stats.total - stats.coincidencias > 0) {
          doc.setFillColor(244, 67, 54);
          doc.rect(centerX, centerY - radius, radius, radius * 2, 'F');
        }
        
        // Leyenda
        doc.setFontSize(8);
        doc.setTextColor(76, 175, 80);
        doc.text(`■ Con Coincidencia: ${stats.coincidencias} (${stats.porcentaje}%)`, 20, startY + 70);
        doc.setTextColor(244, 67, 54);
        doc.text(`■ Sin Coincidencia: ${stats.total - stats.coincidencias}`, 20, startY + 75);
        
        startY += 85;
      }
    } else {
      // Representación alternativa para gráfico de barras
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      doc.text(`Gráfico de Barras - ${selectedMetric}`, 20, startY);
      startY += 15;
      
      if (reportType === 'cross-check') {
        const barWidth = 30;
        const maxBarHeight = 40;
        const barSpacing = 50;
        
        // Barra de coincidencias
        const matchHeight = (stats.coincidencias / stats.total) * maxBarHeight;
        doc.setFillColor(76, 175, 80);
        doc.rect(30, startY + maxBarHeight - matchHeight, barWidth, matchHeight, 'F');
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        doc.text('Coincidencias', 25, startY + maxBarHeight + 8);
        doc.text(stats.coincidencias.toString(), 35, startY + maxBarHeight + 13);
        
        // Barra sin coincidencias
        const noMatchHeight = ((stats.total - stats.coincidencias) / stats.total) * maxBarHeight;
        doc.setFillColor(244, 67, 54);
        doc.rect(30 + barSpacing, startY + maxBarHeight - noMatchHeight, barWidth, noMatchHeight, 'F');
        doc.text('Sin Coincidencias', 70, startY + maxBarHeight + 8);
        doc.text((stats.total - stats.coincidencias).toString(), 85, startY + maxBarHeight + 13);
        
        startY += maxBarHeight + 20;
      }
    }
    
    return startY;
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
          <Button variant="outline" size="sm" iconName="Download" onClick={handleExportVisualization}>
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