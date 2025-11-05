# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir a TecnoLeads! Este documento te guiará en el proceso.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Contribuir?](#cómo-contribuir)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Mejoras](#sugerir-mejoras)
- [Pull Requests](#pull-requests)
- [Estándares de Código](#estándares-de-código)
- [Commits](#commits)
- [Testing](#testing)

## 📜 Código de Conducta

Este proyecto adhiere a un código de conducta. Al participar, se espera que mantengas un ambiente respetuoso y colaborativo.

## 🚀 ¿Cómo Contribuir?

### 1. Fork el Repositorio

```bash
# Clonar tu fork
git clone https://github.com/tu-usuario/TecnoLeads-v1.git
cd TecnoLeads-v1

# Agregar upstream
git remote add upstream https://github.com/original/TecnoLeads-v1.git
```

### 2. Crear una Rama

```bash
# Actualizar main
git checkout main
git pull upstream main

# Crear nueva rama
git checkout -b feature/mi-nueva-funcionalidad
# o
git checkout -b fix/correccion-bug
```

**Nomenclatura de ramas:**
- `feature/` - nuevas funcionalidades
- `fix/` - correcciones de bugs
- `docs/` - cambios en documentación
- `refactor/` - refactorización de código
- `test/` - agregar/mejorar tests
- `chore/` - tareas de mantenimiento

### 3. Hacer Cambios

```bash
# Instalar dependencias
cd backend && npm install
cd ../frontend && npm install

# Hacer tus cambios
# ...

# Probar los cambios
npm run dev
```

### 4. Commit

```bash
git add .
git commit -m "feat: agregar nueva funcionalidad X"
```

Ver [Estándares de Commits](#commits) más abajo.

### 5. Push

```bash
git push origin feature/mi-nueva-funcionalidad
```

### 6. Crear Pull Request

- Ve a GitHub
- Click "New Pull Request"
- Describe tus cambios
- Espera revisión

## 🐛 Reportar Bugs

Antes de reportar un bug:

1. ✅ Busca si ya fue reportado en [Issues](https://github.com/tu-repo/issues)
2. ✅ Verifica que sea un bug real
3. ✅ Recopila información relevante

### Template para Reportar Bug

```markdown
**Descripción del Bug**
Una descripción clara y concisa del bug.

**Pasos para Reproducir**
1. Ve a '...'
2. Haz click en '...'
3. Scroll down a '...'
4. Ver error

**Comportamiento Esperado**
Lo que esperabas que sucediera.

**Screenshots**
Si es aplicable, agrega screenshots.

**Entorno:**
 - OS: [e.g. Windows 11]
 - Node Version: [e.g. 18.17.0]
 - Browser: [e.g. Chrome 120]

**Información Adicional**
Cualquier contexto adicional sobre el problema.
```

## 💡 Sugerir Mejoras

Para sugerir nuevas funcionalidades:

1. Abre un **Issue** con el label `enhancement`
2. Describe la funcionalidad
3. Explica por qué sería útil
4. Propón una implementación (opcional)

### Template para Sugerencias

```markdown
**¿Tu sugerencia está relacionada con un problema?**
Ej: "Siempre me frustro cuando..."

**Describe la solución que te gustaría**
Una descripción clara de lo que quieres que suceda.

**Describe alternativas consideradas**
Otras soluciones o funcionalidades que consideraste.

**Contexto adicional**
Cualquier contexto o screenshot sobre la sugerencia.
```

## 🔄 Pull Requests

### Checklist antes de PR

- [ ] Código sigue los estándares del proyecto
- [ ] Tests agregados/actualizados
- [ ] Documentación actualizada
- [ ] Commits siguen convención
- [ ] Build pasa sin errores
- [ ] No hay linter warnings
- [ ] PR apunta a `main` branch

### Template de Pull Request

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] Breaking change (fix o feature que causa que funcionalidad existente no funcione)
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas que ejecutaste

## Checklist
- [ ] Mi código sigue los estándares
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan warnings
- [ ] He agregado tests
- [ ] Tests nuevos y existentes pasan
```

## 📏 Estándares de Código

### JavaScript/React

```javascript
// ✅ Bueno
const fetchUserData = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// ❌ Malo
const fetchUserData = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};
```

### Estilo

- **Indentación**: 2 espacios
- **Comillas**: Simples para JS, dobles para JSX
- **Semicolons**: Usar siempre
- **Naming**: camelCase para variables/funciones, PascalCase para componentes

### ESLint

```bash
# Verificar código
npm run lint

# Auto-fix
npm run lint:fix
```

### Prettier

El proyecto usa Prettier para formateo automático.

```bash
# Formatear código
npm run format
```

## 📝 Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

### Formato

```
<tipo>(<scope>): <descripción>

[cuerpo opcional]

[footer opcional]
```

### Tipos

- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato (no afectan código)
- `refactor`: Refactorización de código
- `test`: Agregar/modificar tests
- `chore`: Tareas de mantenimiento

### Ejemplos

```bash
# Nueva funcionalidad
git commit -m "feat(import): agregar progreso en tiempo real"

# Bug fix
git commit -m "fix(auth): corregir refresh token expiration"

# Documentación
git commit -m "docs(readme): actualizar instrucciones instalación"

# Refactor
git commit -m "refactor(api): simplificar manejo de errores"

# Breaking change
git commit -m "feat(api)!: cambiar estructura de respuesta

BREAKING CHANGE: la respuesta ahora incluye metadata en un objeto separado"
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Escribir Tests

```javascript
// Ejemplo: backend/tests/auth.test.js
describe('Auth API', () => {
  it('should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

## 🎨 Agregar Nuevas Funcionalidades

### Frontend Component

```jsx
// frontend/src/components/MiNuevoComponente.jsx
import { useState } from 'react';

const MiNuevoComponente = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  return (
    <div className="card">
      {/* Tu componente */}
    </div>
  );
};

export default MiNuevoComponente;
```

### Backend Endpoint

```javascript
// backend/src/routes/miNuevaRuta.routes.js
import express from 'express';
import { miControlador } from '../controllers/miControlador.js';

const router = express.Router();

router.get('/nueva-ruta', miControlador);

export default router;
```

## 📚 Documentación

Al agregar nuevas funcionalidades, actualiza:

- `README.md` - si cambia la descripción general
- `INSTALL.md` - si cambia el proceso de instalación
- `DEPLOYMENT.md` - si afecta el deployment
- `CHANGELOG.md` - siempre agregar cambios aquí
- Comentarios en código para lógica compleja

## 🙏 Reconocimientos

¡Gracias por contribuir a TecnoLeads! Tu ayuda hace que este proyecto sea mejor para todos.

## ❓ ¿Preguntas?

Si tienes preguntas:

1. Revisa la documentación existente
2. Busca en Issues cerrados
3. Abre un nuevo Issue con el label `question`
4. Contacta a los maintainers

---

**Happy Coding! 💻✨**


