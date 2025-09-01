import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import reportService from '../../../services/reportService';
// Importación dinámica de jsPDF para evitar errores de SSR
let jsPDF = null;
let autoTable = null;

const loadJsPDF = async () => {
  if (!jsPDF) {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.default;
    await import('jspdf-autotable');
  }
  return jsPDF;
};

const ExportOptions = ({ onExport }) => {
  const location = useLocation();
  const crossResults = location.state?.crossResults;
  const selectedKey = location.state?.selectedKey;
  const selectedResult = location.state?.selectedResult;
  const selectedFiles = location.state?.selectedFiles;
  const [exportConfig, setExportConfig] = useState({
    format: 'pdf',
    layout: 'portrait',
    includeCharts: true,
    includeData: true,
    includeSummary: true,
    branding: true,
    dateRange: true
  });

  const formatOptions = [
    { value: 'pdf', label: 'PDF', icon: 'FileText' },
    { value: 'excel', label: 'Excel (XLSX)', icon: 'FileSpreadsheet' }
  ];

  const layoutOptions = [
    { value: 'portrait', label: 'Vertical' },
    { value: 'landscape', label: 'Horizontal' }
  ];

  const handleConfigChange = (field, value) => {
    setExportConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreview = async () => {
    console.log('👁️ Generando vista previa...');
    
    if (!crossResults || !crossResults.results) {
      alert('No hay datos de cruce para mostrar vista previa');
      return;
    }

    try {
      // Preparar datos del reporte para vista previa
      const reportData = {
        name: `Reporte de Cruce: ${selectedKey || 'Campo Clave'} vs ${selectedResult || 'Campo Resultado'}`,
        createdBy: localStorage.getItem('currentUser') || 'Usuario Anónimo',
        data: {
          crossResults: crossResults.results,
          configuration: {
            keyField: selectedKey || 'Campo Clave',
            resultField: selectedResult || 'Campo Resultado',
            processedFiles: selectedFiles || [],
            exportConfig: exportConfig
          }
        },
        metadata: {
          totalRecords: crossResults.results.length,
          matchedRecords: crossResults.results.filter(r => r.resultado === 'hay coincidencia').length,
          unmatchedRecords: crossResults.results.filter(r => r.resultado !== 'hay coincidencia').length,
          matchPercentage: Math.round((crossResults.results.filter(r => r.resultado === 'hay coincidencia').length / crossResults.results.length) * 100),
          fileNames: selectedFiles || []
        }
      };

      // Generar HTML para vista previa
      const htmlContent = generateHTMLReport(reportData);
      
      // Abrir en nueva ventana
      const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
      previewWindow.document.write(htmlContent);
      previewWindow.document.close();
      
      console.log('✅ Vista previa generada exitosamente');
      
    } catch (error) {
      console.error('❌ Error generando vista previa:', error);
      alert('Error al generar vista previa. Intente nuevamente.');
    }
  };

  const handleExport = async () => {
    console.log('🔄 Iniciando generación de reporte...');
    console.log('📊 Datos disponibles:', { crossResults, selectedKey, selectedResult, selectedFiles });
    
    if (!crossResults || !crossResults.results) {
      console.error('❌ No hay datos de cruce disponibles');
      alert('No hay datos de cruce para generar el reporte');
      return;
    }

    try {
      console.log('📝 Preparando datos del reporte...');
      
      // Generar reporte directamente sin guardar en BD primero
      const reportData = {
        name: `Reporte de Cruce: ${selectedKey || 'Campo Clave'} vs ${selectedResult || 'Campo Resultado'}`,
        createdBy: localStorage.getItem('currentUser') || 'Usuario Anónimo',
        data: {
          crossResults: crossResults.results,
          configuration: {
            keyField: selectedKey || 'Campo Clave',
            resultField: selectedResult || 'Campo Resultado',
            processedFiles: selectedFiles || [],
            exportConfig: exportConfig
          }
        },
        metadata: {
          totalRecords: crossResults.results.length,
          matchedRecords: crossResults.results.filter(r => r.resultado === 'hay coincidencia').length,
          unmatchedRecords: crossResults.results.filter(r => r.resultado !== 'hay coincidencia').length,
          matchPercentage: Math.round((crossResults.results.filter(r => r.resultado === 'hay coincidencia').length / crossResults.results.length) * 100),
          fileNames: selectedFiles || []
        }
      };

      console.log('📄 Generando archivo de reporte...');
      const fileInfo = await generateReportFile(reportData, exportConfig);
      
      // Guardar en BD después de generar el archivo
      try {
        const currentAuditId = localStorage.getItem('currentAuditId') || crossResults?.auditId || 'AUDIT_DEFAULT';
        
        // Verificar que tenemos los datos necesarios
        if (!crossResults || !crossResults.results) {
          throw new Error('No hay datos de cruce disponibles para guardar');
        }
        
        const dbReportData = {
          name: reportData.name,
          description: `Reporte detallado del cruce de información entre ${selectedKey || 'Campo Clave'} y ${selectedResult || 'Campo Resultado'}. Generado el ${new Date().toLocaleDateString('es-ES')}.`,
          category: 'Cruce de Datos',
          type: 'cross_result',
          auditId: currentAuditId,
          crossResultId: crossResults._id || null,
          createdBy: 'Usuario Actual', // TODO: obtener del contexto de autenticación
          format: fileInfo.format,
          size: `${Math.round(fileInfo.fileSize / 1024)} KB`,
          shared: false,
          views: 0,
          data: {
            crossResults: crossResults,
            configuration: reportData.data.configuration,
            exportConfig: exportConfig,
            results: crossResults.results
          },
          metadata: {
            fileName: fileInfo.fileName,
            generatedAt: new Date().toISOString(),
            includeCharts: exportConfig.includeCharts,
            includeData: exportConfig.includeData,
            includeSummary: exportConfig.includeSummary,
            branding: exportConfig.branding,
            dateRange: exportConfig.dateRange,
            layout: exportConfig.layout,
            totalRecords: crossResults.results.length,
            matchedRecords: crossResults.results.filter(r => r.resultado === 'hay coincidencia').length,
            matchPercentage: Math.round((crossResults.results.filter(r => r.resultado === 'hay coincidencia').length / crossResults.results.length) * 100)
          }
        };
        
        console.log('📤 Enviando datos a la API de reportes:', dbReportData);
        const savedReport = await reportService.createReport(dbReportData);
        console.log('✅ Respuesta de la API:', savedReport);
        
        if (savedReport && (savedReport.success || savedReport._id)) {
          console.log('✅ Reporte guardado en base de datos exitosamente');
          alert(`Reporte generado y guardado exitosamente en formato ${exportConfig.format.toUpperCase()}`);
          
          // Actualizar la lista de reportes guardados si hay un callback
          if (onExport) {
            onExport(savedReport.data || savedReport);
          }
        } else {
          console.error('❌ Error en respuesta de API:', savedReport);
          alert(`Reporte generado exitosamente, pero error al guardar: ${savedReport?.message || 'Error desconocido'}`);
        }
        
      } catch (dbError) {
        console.error('❌ Error al guardar en BD:', dbError);
        console.error('❌ Detalles del error:', dbError.response?.data || dbError.message);
        alert(`Reporte generado exitosamente en formato ${exportConfig.format.toUpperCase()}, pero no se pudo guardar en la base de datos: ${dbError.response?.data?.message || dbError.message}`);
      }
      
    } catch (error) {
      console.error('❌ Error al generar reporte:', error);
      alert('Error al generar el reporte. Intente nuevamente.');
    }
  };

  const generateReportFile = async (reportData, config) => {
    console.log('📁 Generando archivo:', config.format);
    const fileName = `reporte_cruce_${new Date().toISOString().split('T')[0]}`;
    
    try {
      let fileInfo;
      switch (config.format) {
        case 'pdf':
          fileInfo = await generatePDFReport(reportData, fileName);
          break;
        case 'excel':
          fileInfo = generateExcelReport(reportData, fileName);
          break;
        default:
          fileInfo = generateJSONReport(reportData, fileName);
      }
      console.log('✅ Archivo generado exitosamente');
      return fileInfo;
    } catch (error) {
      console.error('❌ Error generando archivo:', error);
      throw error;
    }
  };

  const generatePDFReport = async (reportData, fileName) => {
    try {
      // Cargar jsPDF dinámicamente
      const PDFClass = await loadJsPDF();
      
      const { data, metadata } = reportData;
      const results = data.crossResults || [];
      const config = data.configuration || {};
      
      // Crear nuevo documento PDF
      const doc = new PDFClass({
        orientation: exportConfig.layout === 'landscape' ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configurar fuentes
      doc.setFont('helvetica');
      
      // Título principal
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(reportData.name, 20, 25);
      
      // Información del reporte
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${new Date().toLocaleDateString('es-ES')}`, 20, 35);
      doc.text(`Por: ${reportData.createdBy}`, 20, 40);
      
      // Obtener información de auditoría
      const currentAuditId = localStorage.getItem('currentAuditId');
      if (currentAuditId) {
        doc.text(`Auditoría: ${currentAuditId}`, 20, 45);
      }
      
      let currentY = 55;
      
      // Incluir marca corporativa si está seleccionada
      if (exportConfig.branding) {
        doc.setFontSize(16);
        doc.setTextColor(66, 139, 202); // Color azul corporativo
        doc.text('AudiconFlow', 20, currentY);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Sistema de Gestión de Auditorías', 20, currentY + 5);
        currentY += 15;
      }
      
      // Incluir rango de fechas si está seleccionado
      if (exportConfig.dateRange) {
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Período de análisis: ${new Date().toLocaleDateString('es-ES')}`, 20, currentY);
        currentY += 10;
      }
      
      // Incluir resumen ejecutivo si está seleccionado
      if (exportConfig.includeSummary) {
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text('Resumen Ejecutivo', 20, currentY);
        currentY += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Total de registros: ${metadata.totalRecords}`, 20, currentY);
        doc.text(`Coincidencias: ${metadata.matchedRecords} (${metadata.matchPercentage}%)`, 20, currentY + 5);
        doc.text(`Sin coincidencias: ${metadata.unmatchedRecords}`, 20, currentY + 10);
        doc.text(`Archivos procesados: ${metadata.fileNames.join(', ')}`, 20, currentY + 15);
        currentY += 25;
      }
      
      // Incluir gráficos y visualizaciones si está seleccionado
      if (exportConfig.includeCharts) {
        doc.setFontSize(12);
        doc.setTextColor(40, 40, 40);
        doc.text('Análisis Visual', 20, currentY);
        currentY += 10;
        
        // Crear gráfico simple de barras con texto
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.text(`Tasa de coincidencias: ${metadata.matchPercentage}%`, 20, currentY);
        
        // Barra visual simple
        const barWidth = 100;
        const barHeight = 5;
        const fillWidth = (metadata.matchPercentage / 100) * barWidth;
        
        // Fondo de la barra
        doc.setFillColor(230, 230, 230);
        doc.rect(20, currentY + 2, barWidth, barHeight, 'F');
        
        // Relleno de la barra
        doc.setFillColor(76, 175, 80);
        doc.rect(20, currentY + 2, fillWidth, barHeight, 'F');
        
        currentY += 15;
      }
      
      // Preparar datos para la tabla
      const tableColumns = [
        { header: config.keyField || 'Campo Clave', dataKey: 'key' },
        { header: config.resultField || 'Campo Resultado', dataKey: 'result' },
        { header: 'Estado', dataKey: 'status' },
        { header: 'Archivos', dataKey: 'files' }
      ];
      
      const tableRows = results.map(result => ({
        key: result.valor || '',
        result: result.resultadoAsignado || 'N/A',
        status: result.resultado || '',
        files: result.archivos?.join(', ') || 'N/A'
      }));
      
      // Incluir datos tabulares si está seleccionado
      if (exportConfig.includeData) {
        // Generar tabla con autoTable
        doc.autoTable({
          columns: tableColumns,
          body: tableRows,
          startY: currentY,
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: 50,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        didParseCell: function(data) {
          // Colorear filas según el estado
          if (data.section === 'body' && data.column.dataKey === 'status') {
            if (data.cell.text[0] === 'hay coincidencia') {
              data.cell.styles.fillColor = [212, 237, 218]; // Verde claro
              data.cell.styles.textColor = [25, 135, 84]; // Verde oscuro
            } else {
              data.cell.styles.fillColor = [248, 215, 218]; // Rojo claro
              data.cell.styles.textColor = [220, 53, 69]; // Rojo oscuro
            }
          }
        },
        margin: { top: 20, right: 20, bottom: 20, left: 20 },
        });
      }
      
      // Pie de página
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount} - AudiconFlow`,
          doc.internal.pageSize.width - 20,
          doc.internal.pageSize.height - 10,
          { align: 'right' }
        );
      }
      
      // Descargar el PDF
      doc.save(`${fileName}.pdf`);
      console.log('✅ PDF generado exitosamente');
      
      // Retornar información del archivo generado para guardarlo en BD
      return {
        fileName: `${fileName}.pdf`,
        fileSize: doc.internal.pageSize.width * doc.internal.pageSize.height, // Estimación
        format: 'PDF',
        content: doc.output('datauristring') // Para guardar en BD si es necesario
      };
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      // Fallback al método HTML si falla jsPDF
      const htmlContent = generateHTMLReport(reportData);
      const blob = new Blob([htmlContent], { type: 'text/html' });
      downloadFile(blob, `${fileName}.html`);
      
      return {
        fileName: `${fileName}.html`,
        fileSize: htmlContent.length,
        format: 'HTML',
        content: htmlContent
      };
    }
  };

  const generateExcelReport = (reportData, fileName) => {
    // Generar CSV que se puede abrir en Excel
    const csvContent = generateCSVContent(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${fileName}.csv`);
    
    return {
      fileName: `${fileName}.csv`,
      fileSize: csvContent.length,
      format: 'CSV',
      content: csvContent
    };
  };

  const generateCSVReport = (reportData, fileName) => {
    const csvContent = generateCSVContent(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, `${fileName}.csv`);
  };

  const generateJSONReport = (reportData, fileName) => {
    const jsonContent = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    downloadFile(blob, `${fileName}.json`);
  };

  const generateHTMLReport = (reportData) => {
    const { data, metadata } = reportData;
    const results = data.crossResults || [];
    const config = data.configuration || {};
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${reportData.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .match { background-color: #d4edda; }
        .no-match { background-color: #f8d7da; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${reportData.name}</h1>
        <p>Generado el: ${new Date().toLocaleDateString('es-ES')}</p>
        <p>Por: ${reportData.createdBy}</p>
    </div>
    
    <div class="summary">
        <h2>Resumen Ejecutivo</h2>
        <p><strong>Total de registros:</strong> ${metadata.totalRecords}</p>
        <p><strong>Coincidencias:</strong> ${metadata.matchedRecords} (${metadata.matchPercentage}%)</p>
        <p><strong>Sin coincidencias:</strong> ${metadata.unmatchedRecords}</p>
        <p><strong>Archivos procesados:</strong> ${metadata.fileNames.join(', ')}</p>
    </div>
    
    <h2>Resultados Detallados</h2>
    <table>
        <thead>
            <tr>
                <th>${config.keyField}</th>
                <th>${config.resultField}</th>
                <th>Estado</th>
                <th>Archivos</th>
            </tr>
        </thead>
        <tbody>
            ${results.map(result => `
                <tr class="${result.resultado === 'hay coincidencia' ? 'match' : 'no-match'}">
                    <td>${result.valor}</td>
                    <td>${result.resultadoAsignado || 'N/A'}</td>
                    <td>${result.resultado}</td>
                    <td>${result.archivos?.join(', ') || 'N/A'}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
  };

  const generateCSVContent = (reportData) => {
    const { data } = reportData;
    const results = data.crossResults || [];
    const config = data.configuration || {};
    
    const headers = [config.keyField, config.resultField, 'Estado', 'Archivos'];
    const csvRows = [
      headers.join(','),
      ...results.map(result => [
        `"${result.valor}"`,
        `"${result.resultadoAsignado || 'N/A'}"`,
        `"${result.resultado}"`,
        `"${result.archivos?.join('; ') || 'N/A'}"`
      ].join(','))
    ];
    
    return csvRows.join('\n');
  };

  const downloadFile = (blob, fileName) => {
    console.log('⬇️ Iniciando descarga:', fileName);
    try {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('✅ Descarga iniciada exitosamente');
    } catch (error) {
      console.error('❌ Error en descarga:', error);
      throw error;
    }
  };

  const getFormatIcon = (format) => {
    const formatMap = {
      pdf: 'FileText',
      excel: 'FileSpreadsheet',
      csv: 'Database',
      powerpoint: 'Presentation'
    };
    return formatMap[format] || 'FileText';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-warning/10 rounded-lg">
          <Icon name="Download" size={20} color="var(--color-warning)" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Generar Reporte</h3>
          <p className="text-sm text-muted-foreground">Configure el formato y contenido del reporte del cruce de información</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Formato de Exportación</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formatOptions.map((format) => (
              <div
                key={format.value}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  exportConfig.format === format.value
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                }`}
                onClick={() => handleConfigChange('format', format.value)}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <Icon 
                    name={format.icon} 
                    size={24} 
                    color={exportConfig.format === format.value ? 'var(--color-primary)' : 'var(--color-muted-foreground)'} 
                  />
                  <span className={`text-sm font-medium ${
                    exportConfig.format === format.value ? 'text-primary' : 'text-foreground'
                  }`}>
                    {format.label}
                  </span>
                </div>
                {exportConfig.format === format.value && (
                  <div className="absolute top-2 right-2">
                    <Icon name="Check" size={16} color="var(--color-primary)" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Layout Options */}
        {(exportConfig.format === 'pdf' || exportConfig.format === 'powerpoint') && (
          <div>
            <Select
              label="Orientación de Página"
              options={layoutOptions}
              value={exportConfig.layout}
              onChange={(value) => handleConfigChange('layout', value)}
            />
          </div>
        )}

        {/* Content Options */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-4">Contenido a Incluir</label>
          <div className="space-y-3">
            <Checkbox
              label="Incluir gráficos y visualizaciones"
              checked={exportConfig.includeCharts}
              onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
            />
            <Checkbox
              label="Incluir datos tabulares"
              checked={exportConfig.includeData}
              onChange={(e) => handleConfigChange('includeData', e.target.checked)}
            />
            <Checkbox
              label="Incluir resumen ejecutivo"
              checked={exportConfig.includeSummary}
              onChange={(e) => handleConfigChange('includeSummary', e.target.checked)}
            />
            <Checkbox
              label="Incluir marca corporativa"
              checked={exportConfig.branding}
              onChange={(e) => handleConfigChange('branding', e.target.checked)}
            />
            <Checkbox
              label="Incluir rango de fechas en encabezado"
              checked={exportConfig.dateRange}
              onChange={(e) => handleConfigChange('dateRange', e.target.checked)}
            />
          </div>
        </div>

        {/* Export Preview */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <Icon name="Eye" size={16} color="var(--color-muted-foreground)" />
            <span className="text-sm font-medium text-foreground">Vista Previa de Exportación</span>
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex items-center space-x-2">
              <Icon name={getFormatIcon(exportConfig.format)} size={14} />
              <span>Formato: {formatOptions.find(f => f.value === exportConfig.format)?.label}</span>
            </div>
            {(exportConfig.format === 'pdf' || exportConfig.format === 'powerpoint') && (
              <div className="flex items-center space-x-2">
                <Icon name="Layout" size={14} />
                <span>Orientación: {layoutOptions.find(l => l.value === exportConfig.layout)?.label}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <Icon name="Package" size={14} />
              <span>
                Contenido: {[
                  exportConfig.includeCharts && 'Gráficos',
                  exportConfig.includeData && 'Datos',
                  exportConfig.includeSummary && 'Resumen'
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            El archivo se descargará automáticamente una vez generado
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              iconName="Eye" 
              iconPosition="left"
              onClick={handlePreview}
              disabled={!crossResults || !crossResults.results}
            >
              Vista Previa
            </Button>
            <Button 
              variant="default" 
              onClick={handleExport}
              iconName="FileText" 
              iconPosition="left"
              disabled={!crossResults || !crossResults.results}
            >
              Generar Reporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;