import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberSession: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock credentials for authentication
  const mockCredentials = {
    admin: { email: "admin@audiconflow.com", password: "admin123" },
    auditor: { email: "auditor@audiconflow.com", password: "auditor123" },
    manager: { email: "manager@audiconflow.com", password: "manager123" }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de correo electrónico inválido';
    }
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Check against mock credentials
      const isValidCredentials = Object.values(mockCredentials).some(
        cred => cred.email === formData.email && cred.password === formData.password
      );
      
      if (isValidCredentials) {
        // Store session data
        if (formData.rememberSession) {
          localStorage.setItem('audiconflow_session', JSON.stringify({
            email: formData.email,
            loginTime: new Date().toISOString()
          }));
        }
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        setErrors({
          general: 'Credenciales inválidas. Use: admin@audiconflow.com / admin123'
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    alert('Funcionalidad de recuperación de contraseña próximamente disponible');
  };

  return (
    <div className="w-full max-w-md mx-auto bg-card rounded-xl shadow-lg p-8 border border-border">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-xl mx-auto mb-4">
          <Icon name="AudioWaveform" size={32} color="white" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Bienvenido a AudiconFlow
        </h1>
        <p className="text-muted-foreground text-sm">
          Inicia sesión para acceder a tu plataforma de auditoría
        </p>
      </div>

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="AlertCircle" size={16} color="#DC2626" />
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Correo Electrónico"
          type="email"
          name="email"
          placeholder="ejemplo@empresa.com"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
          className="w-full"
        />

        <Input
          label="Contraseña"
          type="password"
          name="password"
          placeholder="Ingresa tu contraseña"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
          className="w-full"
        />

        <div className="flex items-center justify-between">
          <Checkbox
            label="Recordar sesión"
            checked={formData.rememberSession}
            onChange={handleInputChange}
            name="rememberSession"
            size="sm"
          />
          
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          className="mt-8"
        >
          {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          ¿Necesitas una cuenta?{' '}
          <button
            onClick={() => alert('Registro próximamente disponible')}
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Contacta al administrador
          </button>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-border">
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p className="font-medium">Credenciales de prueba:</p>
          <p>Admin: admin@audiconflow.com / admin123</p>
          <p>Auditor: auditor@audiconflow.com / auditor123</p>
          <p>Manager: manager@audiconflow.com / manager123</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;