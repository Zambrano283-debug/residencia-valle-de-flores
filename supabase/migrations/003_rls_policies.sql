-- ============================================================
-- MIGRACIÓN 003: POLÍTICAS RLS (reglas de acceso por tabla)
-- ============================================================
-- Aquí se definen las reglas concretas de quién puede hacer qué en
-- cada tabla, ahora que RLS está activado (ver 002_enable_rls.sql).
-- Cada CREATE POLICY se traduce, en términos simples, como:
--   "Para la operación X (SELECT/INSERT/UPDATE/DELETE),
--    permite la fila SOLO SI se cumple esta condición."
-- - USING (...)      -> condición para leer/actualizar/borrar una fila
-- - WITH CHECK (...) -> condición para que una fila nueva/editada sea válida
--
-- Patrón repetido en varias políticas: comprobar si el usuario actual
-- (auth.uid()) tiene role = 'admin' en la tabla user_roles, para darle
-- permisos ampliados frente a un usuario normal.
-- ============================================================

-- ============================================
-- TABLA: contact_requests (Formulario de contacto)
-- ============================================
-- Permitir a cualquiera insertar contactos
CREATE POLICY "Anyone can insert contact requests"
  ON contact_requests
  FOR INSERT
  WITH CHECK (true);

-- Solo el admin puede ver todas las solicitudes
CREATE POLICY "Only admin can view all contact requests"
  ON contact_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- El usuario que creó puede ver su solicitud
-- Nota: se corrigió el uso de current_user_email(), que no existe en
-- Postgres/Supabase. La forma correcta de obtener el correo del usuario
-- autenticado es leerlo desde el JWT con auth.jwt() ->> 'email'.
CREATE POLICY "Users can view their own contact request"
  ON contact_requests
  FOR SELECT
  USING (auth.jwt() ->> 'email' = email);

-- ============================================
-- TABLA: services (Servicios)
-- ============================================
-- Todos pueden ver servicios
CREATE POLICY "Everyone can view services"
  ON services
  FOR SELECT
  USING (true);

-- Solo admin puede insertar servicios
CREATE POLICY "Only admin can insert services"
  ON services
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Solo admin puede actualizar servicios
CREATE POLICY "Only admin can update services"
  ON services
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Solo admin puede eliminar servicios
CREATE POLICY "Only admin can delete services"
  ON services
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- TABLA: activities (Actividades)
-- ============================================
-- Todos pueden ver actividades
CREATE POLICY "Everyone can view activities"
  ON activities
  FOR SELECT
  USING (true);

-- Solo admin puede crear actividades
CREATE POLICY "Only admin can insert activities"
  ON activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Solo admin puede actualizar actividades
CREATE POLICY "Only admin can update activities"
  ON activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Solo admin puede eliminar actividades
CREATE POLICY "Only admin can delete activities"
  ON activities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- TABLA: activity_participants (Participantes)
-- ============================================
-- Los residentes pueden ver en qué actividades están
CREATE POLICY "Residents can view their activities"
  ON activity_participants
  FOR SELECT
  USING (resident_id = auth.uid());

-- Admin puede ver todos
CREATE POLICY "Admin can view all participants"
  ON activity_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Residentes pueden registrarse
CREATE POLICY "Residents can register for activities"
  ON activity_participants
  FOR INSERT
  WITH CHECK (resident_id = auth.uid());

-- ============================================
-- TABLA: local_requests (Solicitudes locales)
-- ============================================
-- Los residentes ven solo sus solicitudes
CREATE POLICY "Residents can view own requests"
  ON local_requests
  FOR SELECT
  USING (resident_id = auth.uid());

-- Admin ve todas
CREATE POLICY "Admin can view all requests"
  ON local_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Residentes pueden crear solicitudes
CREATE POLICY "Residents can create requests"
  ON local_requests
  FOR INSERT
  WITH CHECK (resident_id = auth.uid());

-- Residentes pueden actualizar sus solicitudes
CREATE POLICY "Residents can update own requests"
  ON local_requests
  FOR UPDATE
  USING (resident_id = auth.uid());

-- Admin puede actualizar cualquier solicitud
CREATE POLICY "Admin can update any request"
  ON local_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- TABLA: residents (Residentes)
-- ============================================
-- Los residentes ven solo su información
CREATE POLICY "Residents can view own profile"
  ON residents
  FOR SELECT
  USING (id = auth.uid());

-- Admin ve todos
CREATE POLICY "Admin can view all residents"
  ON residents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Admin puede actualizar residentes
CREATE POLICY "Admin can update residents"
  ON residents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Admin puede eliminar residentes
CREATE POLICY "Admin can delete residents"
  ON residents
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- TABLA: institutional_info (Info institucional)
-- ============================================
-- Todos pueden ver información institucional
CREATE POLICY "Everyone can view institutional info"
  ON institutional_info
  FOR SELECT
  USING (true);

-- Solo admin puede insertar
CREATE POLICY "Only admin can insert institutional info"
  ON institutional_info
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Solo admin puede actualizar
CREATE POLICY "Only admin can update institutional info"
  ON institutional_info
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Solo admin puede eliminar
CREATE POLICY "Only admin can delete institutional info"
  ON institutional_info
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- TABLA: user_roles (Roles de usuarios)
-- ============================================
-- Los usuarios pueden ver su propio rol
CREATE POLICY "Users can view own role"
  ON user_roles
  FOR SELECT
  USING (id = auth.uid());

-- Admin puede ver todos los roles
CREATE POLICY "Admin can view all roles"
  ON user_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur2
      WHERE ur2.id = auth.uid() 
      AND ur2.role = 'admin'
    )
  );

-- Admin puede actualizar roles
CREATE POLICY "Admin can update roles"
  ON user_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur2
      WHERE ur2.id = auth.uid() 
      AND ur2.role = 'admin'
    )
  );
