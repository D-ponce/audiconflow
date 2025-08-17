import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityBadge = () => {
  return (
    <div className="absolute bottom-6 left-6 right-6 z-10">
      <div className="bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Shield" size={16} color="currentColor" />
            <span>Conexión Segura</span>
          </div>
          
          <div className="w-px h-4 bg-border"></div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="Lock" size={16} color="currentColor" />
            <span>Datos Encriptados</span>
          </div>
          
          <div className="w-px h-4 bg-border"></div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Icon name="CheckCircle" size={16} color="currentColor" />
            <span>ISO 27001</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityBadge;