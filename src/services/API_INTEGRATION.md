# Integración de API Backend

## Estructura de Servicios

La aplicación ahora incluye una arquitectura organizada para la comunicación con el backend:

### 📁 `src/services/api/`

#### `apiConfig.ts`

- **Configuración base** para todas las llamadas a la API
- **Cliente HTTP** reutilizable con manejo automático de tokens
- **Tipos de respuesta** estándar de la API
- **URL base**: `https://soydanirodriguezz-back-efdec0a3crfpdkcz.centralus-01.azurewebsites.net/api/v1`

#### `authService.ts`

- **Servicio de autenticación** completo
- **Manejo de tokens JWT** con localStorage
- **Decodificación y validación** de tokens
- **Gestión de permisos** por roles

#### `index.ts`

- **Punto de entrada** para todos los servicios de API
- **Exportación centralizada** de tipos y servicios

## 🔐 Autenticación

### Login

```typescript
import { authService } from '@/services/api'

const response = await authService.login({
  email: 'user@example.com',
  password: 'password123',
})
```

### Verificación de Estado

```typescript
// Verificar si está autenticado
const isAuth = authService.isAuthenticated()

// Obtener usuario actual
const user = authService.getCurrentUser()

// Verificar roles
const isAdmin = authService.isAdmin()
const role = authService.getUserRole()
```

### Logout

```typescript
authService.logout() // Limpia token y datos del usuario
```

## 🛡️ Protección de Rutas

Las rutas ahora incluyen guards de autenticación:

```typescript
// Ruta protegida (requiere autenticación)
{
  path: '/admin',
  meta: {
    requiresAuth: true,
    requiredRole: 'admin'
  }
}

// Ruta de invitado (solo no autenticados)
{
  path: '/login',
  meta: {
    requiresGuest: true
  }
}
```

## 📱 Composable de Autenticación

### `useAuth()` - Hook reactivo para autenticación

```typescript
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated, currentUser, isAdmin, userRole, userName, login, logout, initAuth } =
  useAuth()
```

## 🗄️ Almacenamiento

- **Token JWT**: Guardado en `localStorage` como `authToken`
- **Información del usuario**: Guardada en `localStorage` como `userInfo`
- **Persistencia**: Los datos persisten entre sesiones del navegador

## 🔧 Migración desde Mock

### Cambios Realizados:

1. **Eliminado código mock** de `utils/auth.ts`
2. **Integración real** con el backend en `Login.vue`
3. **Actualización de guards** en el router
4. **Gestión reactiva** del estado de autenticación en `App.vue`

### Compatibilidad:

- Las funciones existentes en `utils/auth.ts` mantienen la misma interfaz
- El código existente sigue funcionando sin cambios
- Migración transparente desde autenticación mock a real

## � Gestión de Empleados

### Conceptos Importantes

El sistema de empleados diferencia entre dos tipos de roles:

- **`role`** (Rol Organizacional): String libre que define el departamento o función del empleado
  - Ejemplos: "RECURSOS HUMANOS", "CONTABILIDAD", "GERENCIA GENERAL", "AUDITORÍA"
  
- **`userRole`** (Rol de Sistema): Define permisos de acceso al sistema
  - Valores: `"ADMIN"` o `"EMPLOYEE"`
  - Por defecto: `"EMPLOYEE"`

### Comportamientos Automáticos

#### ✨ Creación de Empleado

- Si **no existe un usuario** con el email del empleado → Se crea automáticamente
- **Contraseña por defecto**: `1234567!`
- **userRole por defecto**: `EMPLOYEE` (si no se especifica)
- Se puede vincular a usuario existente con `userId`

#### 🗑️ Eliminación de Empleado

- Si el empleado tiene usuario asociado → **Se elimina automáticamente**
- **Eliminación en cascada**: Usuario → Empleado
- Registrado en logs para auditoría

### Endpoints Disponibles

#### 1. Crear Empleado

```typescript
import { useEmployees } from '@/composables/useEmployees'

const { createEmployee } = useEmployees()

// Con userRole específico
await createEmployee({
  name: 'Juan Carlos Pérez',
  email: 'juan.perez@rhc.com.co',
  role: 'GERENCIA GENERAL', // Rol organizacional
  userRole: 'ADMIN', // Rol de sistema
  active: true
})

// Sin userRole (por defecto EMPLOYEE)
await createEmployee({
  name: 'María González',
  email: 'maria.gonzalez@rhc.com.co',
  role: 'RECURSOS HUMANOS',
  active: true
})

// Con userId existente
await createEmployee({
  name: 'Carlos Rodríguez',
  email: 'carlos.rodriguez@rhc.com.co',
  role: 'CONTABILIDAD',
  userId: 1, // Vincular a usuario existente
  active: true
})
```

#### 2. Listar Empleados

```typescript
const { fetchEmployees, employees } = useEmployees()

await fetchEmployees()
console.log(employees.value)
```

#### 3. Obtener Empleado por ID

```typescript
const { getEmployeeById } = useEmployees()

const employee = await getEmployeeById(1)
```

#### 4. Actualizar Empleado

```typescript
const { updateEmployee } = useEmployees()

// Actualizar datos
await updateEmployee(1, {
  name: 'Juan Carlos Pérez Silva',
  role: 'DIRECTOR GENERAL',
  active: false
})

// Vincular usuario
await updateEmployee(1, {
  userId: 2
})

// Desvincular usuario
await updateEmployee(1, {
  userId: null
})
```

#### 5. Cambiar Estado (Activar/Desactivar)

```typescript
const { toggleEmployeeActive } = useEmployees()

await toggleEmployeeActive(1, false) // Desactivar
await toggleEmployeeActive(1, true) // Activar
```

#### 6. Eliminar Empleado

```typescript
const { deleteEmployee } = useEmployees()

await deleteEmployee(1)
// Si tiene usuario asociado, se elimina automáticamente
```

#### 7. Cambiar Contraseña (Solo ADMIN)

```typescript
const { changeEmployeePassword } = useEmployees()

await changeEmployeePassword(1, 'nuevaContraseña123!')
```

**Requisitos**:
- Usuario actual debe tener rol `ADMIN`
- El empleado debe tener usuario asociado
- La contraseña se valida según reglas de seguridad
- Se registra en logs para auditoría

#### 8. Cambiar Rol de Sistema (Solo ADMIN)

```typescript
const { changeEmployeeUserRole } = useEmployees()

await changeEmployeeUserRole(1, 'ADMIN') // Cambiar a Administrador
await changeEmployeeUserRole(1, 'EMPLOYEE') // Cambiar a Empleado
```

**Requisitos**:
- Usuario actual debe tener rol `ADMIN`
- El empleado debe tener usuario asociado
- Valores válidos: `"ADMIN"` o `"EMPLOYEE"`
- Se registra en logs para auditoría

### Sistema de Permisos

El composable `useAuth` proporciona permisos granulares:

```typescript
import { useAuth } from '@/composables/useAuth'

const {
  canManageEmployees, // Crear, editar, eliminar empleados
  canDeleteEvents,
  canDeleteTasks,
  canDeleteClients,
  canViewTokens,
  canViewTokenDetails,
  canDeleteTokens
} = useAuth()
```

**Restricciones para rol EMPLOYEE**:
- ❌ No puede eliminar eventos
- ❌ No puede eliminar tareas
- ❌ No puede eliminar clientes
- ❌ No puede crear/editar/eliminar empleados
- ❌ No puede ver tokens
- ❌ No puede ver detalles de tokens
- ❌ No puede eliminar tokens
- ✅ Puede ver y editar tareas/clientes/eventos

### Componente EmployeeManagement

El componente incluye:
- Tabla con roles organizacionales y de sistema
- Formulario de creación con campo `userRole`
- Botón 🔑 para cambiar contraseña (solo si tiene usuario)
- Botón 👤 para cambiar rol de sistema (solo si tiene usuario)
- Botones ocultos para empleados según permisos

## �🚀 Próximos Pasos

Para extender la integración del backend:

1. **Crear servicios adicionales** en `src/services/api/`
2. **Implementar llamadas CRUD** para equipos, torneos, etc.
3. **Añadir manejo de errores** global
4. **Implementar refresh de tokens** automático
5. **Añadir interceptors** para manejo de respuestas

## 📋 Ejemplo de Uso Completo

```typescript
// En un componente Vue
<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';
import { onMounted } from 'vue';

const { isAuthenticated, currentUser, login, logout, initAuth } = useAuth();

onMounted(() => {
  initAuth(); // Inicializar estado de autenticación
});

const handleLogin = async () => {
  const result = await login({
    email: 'user@example.com',
    password: 'password123'
  });

  if (result.success) {
    console.log('Login exitoso:', currentUser.value);
  } else {
    console.error('Error:', result.message);
  }
};
</script>
```
