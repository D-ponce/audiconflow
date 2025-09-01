# 🧪 Guía de Pruebas Unitarias - AudiconFlow

## 📋 Resumen

Este documento describe la configuración y ejecución de pruebas unitarias para el proyecto AudiconFlow, incluyendo tanto el frontend (React) como el backend (Node.js/Express).

## 🏗️ Estructura de Pruebas

### Frontend (React + Jest + Testing Library)
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   └── __tests__/
│   │   │       ├── Button.test.jsx
│   │   │       └── Input.test.jsx
│   │   └── __tests__/
│   │       └── AppIcon.test.jsx
│   ├── pages/
│   │   ├── login-screen/components/__tests__/
│   │   │   └── LoginForm.test.jsx
│   │   └── dashboard/components/__tests__/
│   │       ├── MetricCard.test.jsx
│   │       └── AuditTrendsChart.test.jsx
│   ├── utils/__tests__/
│   │   └── testUtils.js
│   └── setupTests.js
├── jest.config.js
└── babel.config.js
```

### Backend (Node.js + Jest + Supertest)
```
backend/
├── routes/__tests__/
│   ├── auth.test.js
│   └── audits.test.js
├── models/__tests__/
│   └── Users.test.js
├── src/
│   └── setupTests.js
├── jest.config.js
└── babel.config.js
```

## 🚀 Comandos de Ejecución

### Frontend
```bash
cd frontend

# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch (desarrollo)
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

### Backend
```bash
cd backend

# Instalar dependencias de testing (si no están instaladas)
npm install

# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
```

## 🧩 Componentes Probados

### Frontend
- **Button.jsx**: Variantes, tamaños, estados de carga, eventos
- **Input.jsx**: Validación, errores, tipos de input, eventos
- **LoginForm.jsx**: Validación de formulario, autenticación, manejo de errores
- **MetricCard.jsx**: Renderizado de métricas, indicadores de cambio
- **AuditTrendsChart.jsx**: Gráficos con datos, componentes de Recharts
- **AppIcon.jsx**: Renderizado de iconos, props personalizadas

### Backend
- **auth.js**: Registro de usuarios, login, validaciones, manejo de errores
- **audits.js**: CRUD de auditorías, filtros, estadísticas
- **Users.js**: Modelo de usuario, validaciones, hash de contraseñas

## 📊 Cobertura de Pruebas

Las pruebas cubren:
- ✅ Componentes UI críticos
- ✅ Formularios y validaciones
- ✅ Autenticación y autorización
- ✅ API endpoints principales
- ✅ Modelos de base de datos
- ✅ Manejo de errores
- ✅ Estados de carga y éxito

## 🛠️ Configuración Técnica

### Frontend
- **Jest**: Framework de testing
- **React Testing Library**: Utilidades para testing de React
- **jsdom**: Entorno DOM para pruebas
- **Babel**: Transpilación de ES6+ y JSX

### Backend
- **Jest**: Framework de testing
- **Supertest**: Testing de APIs HTTP
- **Mocking**: Modelos de MongoDB mockeados
- **Babel**: Soporte para ES modules

## 🎯 Utilidades de Testing

### `testUtils.js`
Funciones auxiliares para las pruebas:
- `renderWithRouter()`: Renderiza componentes con React Router
- `mockLocalStorage()`: Mock de localStorage
- `mockFetch()`: Mock de fetch API
- Datos de prueba predefinidos

## 📝 Ejemplos de Uso

### Prueba de Componente
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../Button';

test('maneja eventos de click', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Hacer Click</Button>);
  
  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Prueba de API
```javascript
import request from 'supertest';
import app from '../app';

test('POST /api/login - login exitoso', async () => {
  const response = await request(app)
    .post('/api/login')
    .send({
      user: 'test@example.com',
      password: 'password123'
    });

  expect(response.status).toBe(200);
  expect(response.body.message).toContain('Login exitoso');
});
```

## 🚨 Solución de Problemas

### Errores Comunes

1. **"Cannot find module"**
   - Verificar que todas las dependencias estén instaladas
   - Revisar rutas de importación

2. **"ReferenceError: fetch is not defined"**
   - Usar el mock de fetch en `setupTests.js`

3. **"TypeError: Cannot read property of undefined"**
   - Verificar que los mocks estén configurados correctamente

### Base de Datos de Pruebas
- Las pruebas del backend usan una base de datos de prueba separada
- Se limpia automáticamente después de cada prueba
- Configurada en `src/setupTests.js`

## 📈 Próximos Pasos

- [ ] Agregar pruebas de integración E2E
- [ ] Implementar pruebas de performance
- [ ] Configurar CI/CD con GitHub Actions
- [ ] Aumentar cobertura a 90%+
- [ ] Agregar pruebas de accesibilidad

## 🤝 Contribuciones

Para agregar nuevas pruebas:
1. Crear archivo `*.test.js` o `*.test.jsx` en la carpeta `__tests__`
2. Seguir las convenciones de nomenclatura existentes
3. Incluir casos de éxito, error y edge cases
4. Mantener cobertura de código alta

---

**¡Las pruebas están listas para ejecutarse!** 🎉
