import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, change, changeType, icon, iconColor }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      default:
        return 'Minus';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 p-6 hover:scale-105">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-semibold text-gray-700">{title}</h3>
        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg shadow-md">
          <Icon name={icon} className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">{value}</div>
        {change && (
          <p className="text-xs text-gray-600">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-md ${
              change.type === 'increase' 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-400 to-pink-500 text-white'
            }`}>
              <Icon 
                name={change.type === 'increase' ? 'TrendingUp' : 'TrendingDown'} 
                className="mr-1 h-3 w-3" 
              />
              {change.value}
            </span>
            <span className="ml-2 font-medium">{change.period}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;