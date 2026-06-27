-- ============================================================
-- MIGRACIÓN 001: ESQUEMA DE BASE DE DATOS
-- ============================================================
-- Crea todas las tablas que necesita el proyecto en Supabase.
-- Debe ejecutarse ANTES de 002_enable_rls.sql, 003_rls_policies.sql
-- y 004_auth_triggers.sql (en ese orden), porque esos archivos
-- hacen referencia a las tablas y a la columna "role" creadas aquí.
-- ============================================================

-- Tabla: Residentes
-- Información de cada persona mayor que vive en la residencia.
-- El "id" se vincula 1 a 1 con auth.users cuando el residente tiene
-- una cuenta para iniciar sesión (ver 004_auth_triggers.sql).
CREATE TABLE residents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- identificador único
  first_name VARCHAR(100) NOT NULL,               -- nombre
  last_name VARCHAR(100) NOT NULL,                -- apellido
  email VARCHAR(150),                             -- correo de contacto (opcional)
  phone VARCHAR(20),                              -- teléfono de contacto (opcional)
  date_birth DATE,                                -- fecha de nacimiento
  room_number VARCHAR(50),                        -- número de habitación asignada
  admission_date DATE,                            -- fecha en que ingresó a la residencia
  medical_notes TEXT,                             -- notas médicas relevantes (dato sensible)
  emergency_contact VARCHAR(150),                 -- nombre del contacto de emergencia
  emergency_phone VARCHAR(20),                    -- teléfono del contacto de emergencia
  created_at TIMESTAMP DEFAULT now(),             -- fecha de creación del registro
  updated_at TIMESTAMP DEFAULT now()              -- fecha de última actualización
);

-- Tabla: Servicios
-- Catálogo de servicios que ofrece la residencia (los que se muestran
-- en la sección "Servicios" de la página).
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,        -- nombre del servicio (ej: "Terapia física")
  description TEXT,                  -- descripción detallada
  availability BOOLEAN DEFAULT true, -- si actualmente se ofrece o no
  price DECIMAL(10, 2),              -- precio (si aplica)
  image_url VARCHAR(500),            -- URL de una imagen representativa
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabla: Actividades
-- Eventos/actividades programadas con fecha y hora concretas
-- (distinto de las "actividades" estáticas que se ven en los tabs
-- de la página, que son contenido fijo en script.js).
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,       -- título de la actividad
  description TEXT,                 -- descripción
  schedule_date DATE,                -- fecha en que se realiza
  schedule_time TIME,                -- hora en que se realiza
  location VARCHAR(200),             -- lugar dentro de la residencia
  max_participants INT,              -- cupo máximo de inscritos
  image_url VARCHAR(500),            -- imagen representativa
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabla: Participantes en Actividades
-- Relación muchos-a-muchos entre activities y residents: qué residente
-- está inscrito en qué actividad, y si finalmente asistió o no.
CREATE TABLE activity_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Si se borra la actividad, se borran también sus inscripciones
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  -- Si se borra el residente, se borran sus inscripciones
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  registration_date TIMESTAMP DEFAULT now(), -- cuándo se inscribió
  attended BOOLEAN DEFAULT false             -- si asistió el día del evento
);

-- Tabla: Solicitudes de Contacto
-- Guarda los envíos del formulario público de contacto de la página
-- (equivalente, en el backend compartido, a lo que IndexedDB guarda
-- localmente hoy en el navegador de cada visitante).
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(150) NOT NULL,           -- nombre de quien escribe
  email VARCHAR(150) NOT NULL,          -- correo de quien escribe
  phone VARCHAR(20),                    -- teléfono (opcional)
  subject VARCHAR(300),                 -- asunto/tipo de consulta
  message TEXT NOT NULL,                -- mensaje completo
  status VARCHAR(50) DEFAULT 'pending', -- estado: pending, in_progress, completed, etc.
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabla: Solicitudes Locales
-- Peticiones internas hechas por un residente YA autenticado en el
-- sistema (por ejemplo, una solicitud de mantenimiento), distintas
-- del formulario público de contacto.
CREATE TABLE local_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID REFERENCES residents(id) ON DELETE CASCADE,
  request_type VARCHAR(100) NOT NULL,    -- categoría de la solicitud
  description TEXT NOT NULL,             -- detalle de lo solicitado
  priority VARCHAR(50) DEFAULT 'normal', -- prioridad: normal, alta, urgente, etc.
  status VARCHAR(50) DEFAULT 'pending',  -- estado: pending, in_progress, completed
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP                 -- se llena cuando status = 'completed'
);

-- Tabla: Información Institucional
-- Bloques de texto editables (misión, visión, historia, etc.) que un
-- administrador podría actualizar sin tocar el código del sitio.
CREATE TABLE institutional_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_name VARCHAR(150) NOT NULL UNIQUE, -- identificador único de la sección (ej: "mision")
  content TEXT NOT NULL,                     -- contenido de texto de esa sección
  image_url VARCHAR(500),                    -- imagen asociada (opcional)
  order_index INT,                           -- orden de aparición en la página
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Tabla: Roles de Usuarios
-- Asocia cada usuario autenticado (de auth.users, tabla interna de
-- Supabase) con un rol de la aplicación: 'user', 'resident' o 'admin'.
-- Esta tabla es la base de todo el control de permisos (ver
-- 003_rls_policies.sql). El trigger de 004_auth_triggers.sql crea
-- automáticamente una fila aquí cada vez que alguien se registra.
CREATE TABLE user_roles (
  -- Mismo id que auth.users.id: si se borra la cuenta, se borra su rol
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user', -- 'user' (por defecto), 'resident' o 'admin'
  created_at TIMESTAMP DEFAULT now()
);

-- Índices: aceleran las consultas más frecuentes (búsquedas y filtros
-- por estas columnas). No cambian el comportamiento, solo el rendimiento.
CREATE INDEX idx_residents_email ON residents(email);
CREATE INDEX idx_activities_date ON activities(schedule_date);
CREATE INDEX idx_contact_requests_status ON contact_requests(status);
CREATE INDEX idx_local_requests_status ON local_requests(status);
CREATE INDEX idx_user_roles_role ON user_roles(role);
