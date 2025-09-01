import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Guardar sesión en localStorage
        localStorage.setItem("audiconflow_session", JSON.stringify({
          email: data.email,
          role: data.role,
          loginTime: new Date().toISOString()
        }));

        // Redirigir al dashboard
        navigate("/dashboard");
      } else {
        setErrors({ general: data.error || "Credenciales incorrectas" });
      }
    } catch (err) {
      console.error("❌ Error de conexión:", err);
      
      // Fallback: credenciales de prueba si el backend no responde
      const testCredentials = [
        { email: "admin@audiconflow.com", password: "admin123", role: "administrador", name: "Administrador" },
        { email: "denisse.ponce@empresas.com", password: "denisse12", role: "administrador", name: "Denisse Ponce" }
      ];

      const validUser = testCredentials.find(cred => 
        (cred.email === formData.email || cred.role === formData.email) && 
        cred.password === formData.password
      );

      if (validUser) {
        localStorage.setItem("audiconflow_session", JSON.stringify({
          email: validUser.email,
          role: validUser.role,
          name: validUser.name,
          loginTime: new Date().toISOString()
        }));
        navigate("/dashboard");
      } else {
        setErrors({ general: "Error de conexión con el servidor" });
      }
    }

    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    alert('Funcionalidad de recuperación de contraseña próximamente disponible');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-200 shadow-2xl p-8 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl mx-auto mb-4 shadow-lg">
            <Icon name="AudioWaveform" size={32} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            AudiconFlow
          </h1>
          <p className="text-gray-600 text-sm">
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

        <div className="flex items-center justify-end">
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
      </div>
    </div>
  );
};

export default LoginForm;
