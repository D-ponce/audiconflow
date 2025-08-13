import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportOptions = ({ onExport }) => {
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
    { value: 'excel', label: 'Excel (XLSX)', icon: 'FileSpreadsheet' },
    { value: 'csv', label: 'CSV', icon: 'Database' },
    { value: 'powerpoint', label: 'PowerPoint (PPTX)', icon: 'Presentation' }
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

  const handleExport = () => {
    onExport(exportConfig);
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
          <h3 className="text-lg font-semibold text-foreground">Opciones de Exportación</h3>
          <p className="text-sm text-muted-foreground">Configure el formato y contenido del reporte exportado</p>
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
            <Button variant="outline" iconName="Eye" iconPosition="left">
              Vista Previa
            </Button>
            <Button 
              variant="default" 
              onClick={handleExport}
              iconName="Download" 
              iconPosition="left"
            >
              Exportar Reporte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportOptions;