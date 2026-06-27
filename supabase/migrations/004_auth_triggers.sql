-- ============================================================
-- MIGRACIÓN 004: TRIGGERS DE AUTENTICACIÓN
-- ============================================================
-- Automatiza la asignación de un rol cada vez que alguien crea una
-- cuenta nueva (sign up), para que nunca quede un usuario sin fila
-- en user_roles (lo cual rompería las políticas RLS que consultan
-- esa tabla, ver 003_rls_policies.sql).
-- ============================================================

-- Función que se ejecuta automáticamente después de cada registro nuevo.
-- SECURITY DEFINER: corre con los permisos de quien creó la función
-- (no con los del usuario que se está registrando), necesario porque
-- un usuario nuevo todavía no tendría permiso propio para escribir en
-- user_roles. SET search_path = public evita ambigüedades de esquema.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserta una fila en user_roles con el mismo id del usuario nuevo
  -- y rol 'user' por defecto. ON CONFLICT DO NOTHING evita un error
  -- si por algún motivo ya existiera una fila con ese id.
  INSERT INTO public.user_roles (id, role)
  VALUES (new.id, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Si ya existía un trigger con este nombre (por ejecutar la migración
-- más de una vez), lo elimina primero para poder recrearlo sin error.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger: se dispara automáticamente cada vez que se inserta una fila
-- nueva en auth.users (es decir, cada vez que alguien se registra),
-- y ejecuta handle_new_user() para asignarle el rol 'user' de inmediato.
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
