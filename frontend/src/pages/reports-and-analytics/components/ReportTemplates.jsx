import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      id: 'compliance-trends',
      name: 'Tendencias de Cumplimiento',
      description: 'Análisis de tendencias de cumplimiento por período y ubicación',
      icon: 'TrendingUp',
      category: 'Cumplimiento',
      lastUsed: '2025-07-10',
      popularity: 95
    },
    {
      id: 'auditor-performance',
      name: 'Rendimiento de Auditores',
      description: 'Evaluación del desempeño individual y comparativo de auditores',
      icon: 'Users',
      category: 'Recursos Humanos',
      lastUsed: '2025-07-09',
      popularity: 88
    },
    {
      id: 'location-comparison',
      name: 'Comparación de Ubicaciones',
      description: 'Análisis comparativo entre diferentes ubicaciones de tienda',
      icon: 'MapPin',
      category: 'Operaciones',
      lastUsed: '2025-07-08',
      popularity: 92
    },
    {
      id: 'financial-summary',
      name: 'Resumen Financiero',
      description: 'Resumen ejecutivo de hallazgos financieros y discrepancias',
      icon: 'DollarSign',
      category: 'Financiero',
      lastUsed: '2025-07-07',
      popularity: 85
    },
    {
      id: 'inventory-analysis',
      name: 'Análisis de Inventario',
      description: 'Análisis detallado de discrepancias y tendencias de inventario',
      icon: 'Package',
      category: 'Inventario',
      lastUsed: '2025-07-06',
      popularity: 90
    },
    {
      id: 'risk-assessment',
      name: 'Evaluación de Riesgos',
      description: 'Identificación y análisis de riesgos operacionales y de cumplimiento',
      icon: 'AlertTriangle',
      category: 'Riesgos',
      lastUsed: '2025-07-05',
      popularity: 78
    }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      'Cumplimiento': 'bg-emerald-100 text-emerald-700',
      'Recursos Humanos': 'bg-blue-100 text-blue-700',
      'Operaciones': 'bg-purple-100 text-purple-700',
      'Financiero': 'bg-amber-100 text-amber-700',
      'Inventario': 'bg-cyan-100 text-cyan-700',
      'Riesgos': 'bg-red-100 text-red-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
            <Icon name="FileText" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Plantillas de Reportes</h3>
            <p className="text-sm text-muted-foreground">Seleccione una plantilla predefinida para análisis rápido</p>
          </div>
        </div>
        <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
          Nueva Plantilla
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="group border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onSelectTemplate(template)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Icon name={template.icon} size={20} color="var(--color-primary)" />
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(template.category)}`}>
                  {template.category}
                </span>
              </div>
            </div>

            <h4 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {template.name}
            </h4>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {template.description}
            </p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={12} />
                <span>Usado: {template.lastUsed}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Star" size={12} />
                <span>{template.popularity}%</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                fullWidth
                iconName="Play"
                iconPosition="left"
                className="group-hover:bg-primary/10"
              >
                Usar Plantilla
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportTemplates;