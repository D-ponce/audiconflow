import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Por favor ingresa tu correo electrónico');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      setMessage('Formato de correo electrónico inválido');
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      // Simular envío de correo ficticio
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay de envío
      
      // Generar datos ficticios del correo
      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetLink = `https://audiconflow.com/reset-password?token=${resetToken}`;
      
      // Log ficticio del correo enviado
      console.log(`
📧 CORREO DE RECUPERACIÓN ENVIADO (SIMULADO):
Para: ${email}
Asunto: Recuperación de contraseña - AudiconFlow
Fecha: ${new Date().toLocaleString('es-ES')}

Contenido del correo:
─────────────────────────────
Hola,

Has solicitado restablecer tu contraseña para AudiconFlow.

Haz clic en el siguiente enlace para crear una nueva contraseña:
${resetLink}

Este enlace expirará en 1 hora por seguridad.

Si no solicitaste este cambio, puedes ignorar este correo.

Saludos,
Equipo AudiconFlow
─────────────────────────────
      `);

      setStatus('success');
      setMessage(`✅ Correo de recuperación enviado exitosamente a ${email}. Revisa tu bandeja de entrada y carpeta de spam.`);
      setEmail('');
      
    } catch (error) {
      console.error('Error en simulación:', error);
      setStatus('error');
      setMessage('Error inesperado. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setStatus(null);
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recuperar Contraseña</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-4">
            <Icon name="Mail" size={32} color="white" />
          </div>
          <p className="text-gray-600 text-center text-sm">
            Ingresa tu correo electrónico institucional y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {status && (
          <div className={`mb-4 p-4 rounded-lg border ${
            status === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              <Icon 
                name={status === 'success' ? 'CheckCircle' : 'AlertCircle'} 
                size={16} 
                color={status === 'success' ? '#059669' : '#DC2626'} 
              />
              <p className={`text-sm ${
                status === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {message}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Correo Electrónico Institucional"
            type="email"
            placeholder="ejemplo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full"
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="default"
              loading={isLoading}
              disabled={isLoading || status === 'success'}
              className="flex-1"
            >
              {isLoading ? 'Enviando...' : 'Enviar Enlace'}
            </Button>
          </div>
        </form>

        {status === 'success' && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-600 text-center">
              <Icon name="Info" size={14} className="inline mr-1" />
              Si no recibes el correo en 5 minutos, revisa tu carpeta de spam o contacta al administrador del sistema.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
