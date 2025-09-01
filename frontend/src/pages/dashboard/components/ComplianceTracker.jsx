import React from 'react';
import Icon from '../../../components/AppIcon';

const ComplianceTracker = () => {
  const complianceItems = [
    {
      category: 'Inventario',
      items: [
        { name: 'Conteo físico', status: 'completed', dueDate: '15 Ene', priority: 'high' },
        { name: 'Reconciliación', status: 'in-progress', dueDate: '18 Ene', priority: 'high' },
        { name: 'Documentación', status: 'pending', dueDate: '20 Ene', priority: 'medium' }
      ]
    },
    {
      category: 'Financiero',
      items: [
        { name: 'Revisión de caja', status: 'completed', dueDate: '12 Ene', priority: 'high' },
        { name: 'Arqueo de fondos', status: 'completed', dueDate: '14 Ene', priority: 'high' },
        { name: 'Conciliación bancaria', status: 'in-progress', dueDate: '16 Ene', priority: 'medium' }
      ]
    },
    {
      category: 'Operacional',
      items: [
        { name: 'Procedimientos POS', status: 'completed', dueDate: '10 Ene', priority: 'medium' },
        { name: 'Capacitación staff', status: 'pending', dueDate: '22 Ene', priority: 'low' },
        { name: 'Seguridad tienda', status: 'in-progress', dueDate: '19 Ene', priority: 'high' }
      ]
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return { icon: 'CheckCircle', color: 'text-green-500' };
      case 'in-progress': return { icon: 'Clock', color: 'text-blue-500' };
      case 'pending': return { icon: 'Circle', color: 'text-gray-400' };
      default: return { icon: 'Circle', color: 'text-gray-400' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  const getCategoryProgress = (items) => {
    const completed = items.filter(item => item.status === 'completed').length;
    return Math.round((completed / items.length) * 100);
  };

  return (
    <div className="powerbi-card">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Seguimiento de Compliance</h3>
          <button className="text-primary hover:text-primary/80 text-sm font-medium">
            Ver todo
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {complianceItems.map((category, categoryIndex) => {
          const progress = getCategoryProgress(category.items);
          return (
            <div key={categoryIndex} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-foreground">{category.category}</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {category.items.map((item, itemIndex) => {
                  const statusInfo = getStatusIcon(item.status);
                  return (
                    <div 
                      key={itemIndex} 
                      className={`flex items-center justify-between p-3 border-l-4 bg-gray-50 rounded-r-lg ${getPriorityColor(item.priority)}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon name={statusInfo.icon} size={16} className={statusInfo.color} />
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Vence: {item.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.priority === 'high' ? 'bg-red-100 text-red-800' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Media' : 'Baja'}
                        </span>
                        <button className="p-1 hover:bg-gray-200 rounded">
                          <Icon name="ChevronRight" size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Icon name="Plus" size={16} />
            <span className="text-sm font-medium">Nuevo Item</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Icon name="Download" size={16} />
            <span className="text-sm font-medium">Exportar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComplianceTracker;
