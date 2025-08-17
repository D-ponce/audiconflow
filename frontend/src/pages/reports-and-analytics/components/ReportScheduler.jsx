import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const ReportScheduler = ({ onScheduleReport }) => {
  const [scheduleConfig, setScheduleConfig] = useState({
    frequency: 'weekly',
    dayOfWeek: 'monday',
    dayOfMonth: '1',
    time: '09:00',
    recipients: [],
    format: 'pdf',
    autoSend: true,
    includeAttachment: true
  });

  const [newRecipient, setNewRecipient] = useState('');

  const frequencyOptions = [
    { value: 'daily', label: 'Diario' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' }
  ];

  const dayOfWeekOptions = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  const formatOptions = [
    { value: 'pdf', label: 'PDF' },
    { value: 'excel', label: 'Excel' },
    { value: 'email', label: 'Solo Email' }
  ];

  const handleConfigChange = (field, value) => {
    setScheduleConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addRecipient = () => {
    if (newRecipient && !scheduleConfig.recipients.includes(newRecipient)) {
      setScheduleConfig(prev => ({
        ...prev,
        recipients: [...prev.recipients, newRecipient]
      }));
      setNewRecipient('');
    }
  };

  const removeRecipient = (email) => {
    setScheduleConfig(prev => ({
      ...prev,
      recipients: prev.recipients.filter(r => r !== email)
    }));
  };

  const handleSchedule = () => {
    onScheduleReport(scheduleConfig);
  };

  const existingSchedules = [
    {
      id: 1,
      name: 'Reporte Semanal de Cumplimiento',
      frequency: 'Semanal - Lunes 09:00',
      recipients: 3,
      lastSent: '2025-07-08',
      status: 'active'
    },
    {
      id: 2,
      name: 'Resumen Mensual Ejecutivo',
      frequency: 'Mensual - Día 1 10:00',
      recipients: 5,
      lastSent: '2025-07-01',
      status: 'active'
    },
    {
      id: 3,
      name: 'Análisis Trimestral de Rendimiento',
      frequency: 'Trimestral - Día 1 14:00',
      recipients: 8,
      lastSent: '2025-04-01',
      status: 'paused'
    }
  ];

  return (
    <div className="space-y-6">
      {/* New Schedule Configuration */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg">
            <Icon name="Calendar" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Programar Reporte Automático</h3>
            <p className="text-sm text-muted-foreground">Configure la entrega automática de reportes por email</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Select
              label="Frecuencia"
              options={frequencyOptions}
              value={scheduleConfig.frequency}
              onChange={(value) => handleConfigChange('frequency', value)}
            />

            {scheduleConfig.frequency === 'weekly' && (
              <Select
                label="Día de la Semana"
                options={dayOfWeekOptions}
                value={scheduleConfig.dayOfWeek}
                onChange={(value) => handleConfigChange('dayOfWeek', value)}
              />
            )}

            {scheduleConfig.frequency === 'monthly' && (
              <Input
                label="Día del Mes"
                type="number"
                min="1"
                max="28"
                value={scheduleConfig.dayOfMonth}
                onChange={(e) => handleConfigChange('dayOfMonth', e.target.value)}
                placeholder="1-28"
              />
            )}

            <Input
              label="Hora de Envío"
              type="time"
              value={scheduleConfig.time}
              onChange={(e) => handleConfigChange('time', e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Select
              label="Formato del Reporte"
              options={formatOptions}
              value={scheduleConfig.format}
              onChange={(value) => handleConfigChange('format', value)}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Destinatarios</label>
              <div className="flex space-x-2 mb-3">
                <Input
                  type="email"
                  placeholder="email@ejemplo.com"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" onClick={addRecipient} iconName="Plus">
                  Agregar
                </Button>
              </div>
              
              {scheduleConfig.recipients.length > 0 && (
                <div className="space-y-2">
                  {scheduleConfig.recipients.map((email, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-sm text-foreground">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(email)}
                        iconName="X"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Checkbox
                label="Envío automático habilitado"
                checked={scheduleConfig.autoSend}
                onChange={(e) => handleConfigChange('autoSend', e.target.checked)}
              />
              <Checkbox
                label="Incluir archivo adjunto"
                checked={scheduleConfig.includeAttachment}
                onChange={(e) => handleConfigChange('includeAttachment', e.target.checked)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button
            variant="default"
            onClick={handleSchedule}
            iconName="Calendar"
            iconPosition="left"
            disabled={scheduleConfig.recipients.length === 0}
          >
            Programar Reporte
          </Button>
        </div>
      </div>

      {/* Existing Schedules */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
              <Icon name="Clock" size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Reportes Programados</h3>
              <p className="text-sm text-muted-foreground">Gestione sus reportes automáticos existentes</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {existingSchedules.map((schedule) => (
            <div key={schedule.id} className="border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-foreground">{schedule.name}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      schedule.status === 'active' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
                    }`}>
                      {schedule.status === 'active' ? 'Activo' : 'Pausado'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Icon name="Repeat" size={14} />
                      <span>{schedule.frequency}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Users" size={14} />
                      <span>{schedule.recipients} destinatarios</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Send" size={14} />
                      <span>Último envío: {schedule.lastSent}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" iconName="Edit">
                    Editar
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    iconName={schedule.status === 'active' ? 'Pause' : 'Play'}
                  >
                    {schedule.status === 'active' ? 'Pausar' : 'Activar'}
                  </Button>
                  <Button variant="ghost" size="sm" iconName="Trash2">
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportScheduler;