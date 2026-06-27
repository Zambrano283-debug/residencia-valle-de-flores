-- ============================================================
-- MIGRACIÓN 002: ACTIVAR ROW LEVEL SECURITY (RLS)
-- ============================================================
-- RLS (seguridad a nivel de fila) es el mecanismo de Supabase/Postgres
-- que controla, fila por fila, quién puede leer/insertar/editar/borrar
-- datos de una tabla. Por defecto, si una tabla NO tiene RLS activado,
-- cualquiera con la clave pública (anon key) podría leer o modificar
-- TODOS sus datos sin restricción alguna — algo especialmente riesgoso
-- aquí porque hay información sensible (notas médicas, contactos de
-- emergencia, etc.).
--
-- Este archivo solo ENCIENDE el "interruptor" de seguridad en cada
-- tabla. Las reglas concretas de qué se permite y a quién se definen
-- después, en 003_rls_policies.sql. Si solo se ejecuta este archivo
-- (sin el siguiente), las tablas quedarían bloqueadas para todos,
-- incluido el front-end del sitio.
-- ============================================================

ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutional_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
