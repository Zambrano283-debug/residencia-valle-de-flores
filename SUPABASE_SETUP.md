# 🚀 Configuración de Supabase para Valle de Flores

## ¿Qué se ha configurado?

Se han creado todos los archivos y scripts SQL necesarios para tu base de datos:

### 📂 Archivos creados:

1. **`supabase/migrations/001_create_schema.sql`** - Esquema completo de tablas
2. **`supabase/migrations/002_enable_rls.sql`** - Activar seguridad a nivel de filas
3. **`supabase/migrations/003_rls_policies.sql`** - Políticas de seguridad detalladas
4. **`supabase/migrations/004_auth_triggers.sql`** - Triggers para automatizar roles
5. **`js/supabase-config.js`** - Funciones JavaScript listas para usar
6. **`.env.example`** - Variables de entorno

---

## 🔧 Pasos para completar la configuración en Supabase

### 1. Crear una cuenta en Supabase
- Ve a [supabase.com](https://supabase.com)
- Registrate con GitHub o email
- Crea un nuevo proyecto

### 2. Ejecutar los scripts SQL

En tu dashboard de Supabase:

1. Ve a **SQL Editor**
2. Crea una nueva consulta
3. Copia y pega el contenido de `supabase/migrations/001_create_schema.sql`
4. Ejecuta (botón ▶️)
5. Repite para: `002_enable_rls.sql`, `003_rls_policies.sql`, `004_auth_triggers.sql`

**Alternativa rápida:** Copia todo en una sola consulta:

```sql
-- Pega el contenido de los 4 archivos aquí
-- 001_create_schema.sql
-- 002_enable_rls.sql
-- 003_rls_policies.sql
-- 004_auth_triggers.sql
```

### 3. Obtener credenciales

1. Ve a **Settings** → **API**
2. Copia:
   - `Project URL` → Variable `VITE_SUPABASE_URL`
   - `anon public` key → Variable `VITE_SUPABASE_ANON_KEY`

### 4. Configurar variables de entorno

1. Copia `.env.example` a `.env` o `.env.local`
2. Reemplaza los valores:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5...
```

### 5. Instalar cliente de Supabase

```bash
npm install @supabase/supabase-js
```

---

## 📊 Estructura de Base de Datos

### Tablas principales:

| Tabla | Descripción |
|-------|-------------|
| `residents` | Información de residentes |
| `services` | Servicios ofrecidos |
| `activities` | Actividades programadas |
| `activity_participants` | Registro de participación |
| `contact_requests` | Solicitudes del formulario de contacto |
| `local_requests` | Solicitudes internas de residentes |
| `institutional_info` | Información sobre la institución |
| `user_roles` | Roles de usuarios (admin, resident, user) |

---

## 🔐 Seguridad (RLS)

Se han configurado políticas para:

✅ **Público (sin autenticación):**
- Ver servicios
- Ver actividades
- Ver información institucional
- Enviar solicitudes de contacto

✅ **Residentes (autenticados):**
- Ver su propio perfil
- Crear solicitudes locales
- Registrarse en actividades
- Ver sus solicitudes

✅ **Admin:**
- Acceso completo a todas las tablas
- Crear/actualizar/eliminar datos
- Gestionar solicitudes

---

## 💻 Ejemplo de uso en tu código

### Registrar un usuario:
```javascript
import { signUp } from './js/supabase-config.js'

const result = await signUp('user@example.com', 'password123')
```

### Crear una solicitud de contacto:
```javascript
import { createContactRequest } from './js/supabase-config.js'

const request = await createContactRequest({
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '555-1234',
  subject: 'Información de servicios',
  message: 'Me gustaría saber más...'
})
```

### Obtener actividades:
```javascript
import { getActivities } from './js/supabase-config.js'

const activities = await getActivities()
```

### Registrarse en actividad:
```javascript
import { registerForActivity, getCurrentUser } from './js/supabase-config.js'

const user = await getCurrentUser()
await registerForActivity('activity-id', user.id)
```

---

## 🚨 Checklist

- [ ] Crear cuenta en Supabase
- [ ] Crear proyecto en Supabase
- [ ] Ejecutar script SQL `001_create_schema.sql`
- [ ] Ejecutar script SQL `002_enable_rls.sql`
- [ ] Ejecutar script SQL `003_rls_policies.sql`
- [ ] Ejecutar script SQL `004_auth_triggers.sql`
- [ ] Copiar URL y API Key
- [ ] Crear archivo `.env` con credenciales
- [ ] Instalar `@supabase/supabase-js`
- [ ] Importar funciones en tu código
- [ ] Probar autenticación
- [ ] Probar creación de datos

---

## 🆘 Solución de problemas

**Problema:** "No tienes permisos"
- Verifica que estés autenticado
- Revisa que el rol sea correcto en `user_roles`

**Problema:** "Tabla no existe"
- Asegúrate de haber ejecutado `001_create_schema.sql`

**Problema:** "Variables de entorno no reconocidas"
- Crea `.env.local` en la raíz del proyecto
- Recarga el servidor de desarrollo

**Problema:** "CORS error"
- Ve a Supabase → Settings → API → CORS
- Agrega tu dominio (ej: `http://localhost:5173`)

---

## 📚 Documentación útil

- [Supabase Docs](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✨ Próximos pasos

1. **Configurar autenticación en UI** - Formularios de login/registro
2. **Crear dashboard de admin** - Para gestionar residentes y solicitudes
3. **Conectar formulario de contacto** - Al guardar en Supabase
4. **Mostrar actividades** - Traer datos en tiempo real
5. **Panel de residentes** - Para ver solicitudes y actividades

¿Necesitas ayuda con alguno de estos pasos?
