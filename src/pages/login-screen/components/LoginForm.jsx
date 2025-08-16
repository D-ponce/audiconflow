import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "components/ui/Button";
import Input from "components/ui/Input";
import { Checkbox } from "components/ui/Checkbox";
import Icon from "components/AppIcon";

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user: "",
    password: "",
    rememberSession: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const setFieldError = (name, msg) =>
    setErrors((prev) => ({ ...prev, [name]: msg }));

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setFieldError(name, "");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.user) {
      newErrors.user = "Debes ingresar tu usuario (correo o rol)";
    }
    if (!formData.password) {
      newErrors.password = "Debes ingresar tu contraseña";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: formData.user,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || "Error en login" });
      } else {
        const session = {
          email: data.email,
          role: data.role,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem("audiconflow_session", JSON.stringify(session));
        navigate("/dashboard");
      }
    } catch (err) {
      setErrors({ general: "Error de conexión con el servidor" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-lg p-8 w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} noValidate>
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 grid place-items-center">
            <Icon name="ShieldCheck" className="h-6 w-6 text-primary" />
          </div>
          <h1 className="mt-3 text-2xl font-semibold">AudiconFlow</h1>
          <p className="text-sm text-muted-foreground">Acceso autorizado</p>
        </div>

        <div className="space-y-4">
          <Input
            label="Usuario"
            name="user"
            placeholder="Correo o rol (auditor | supervisor | administrador)"
            value={formData.user}
            onChange={handleInputChange}
            error={errors.user}
            required
            aria-invalid={Boolean(errors.user)}
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
            aria-invalid={Boolean(errors.password)}
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label="Recordar sesión"
              checked={formData.rememberSession}
              onChange={handleInputChange}
              name="rememberSession"
            />
          </div>

          {errors.general && (
            <div
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
              role="alert"
            >
              {errors.general}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            aria-busy={isLoading}
          >
            Ingresar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
