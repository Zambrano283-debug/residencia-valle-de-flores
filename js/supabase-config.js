/**
 * CONFIGURACIÓN Y FUNCIONES DE SUPABASE
 * ================================================
 * ⚠️ IMPORTANTE - estado actual de este archivo:
 * Este archivo usa sintaxis de módulos ES (`import`/`export`) y variables
 * de entorno estilo Vite (`import.meta.env.VITE_...`). Index.html, tal como
 * está hoy, carga únicamente js/script.js con una etiqueta <script> normal
 * (sin type="module"), por lo que este archivo NO se ejecuta todavía en el
 * sitio publicado: es código "listo para conectar", no código activo.
 *
 * Para usarlo en un proyecto real hacen falta, como mínimo:
 *   1. Instalar el paquete: npm install @supabase/supabase-js
 *   2. Usar un bundler/dev-server compatible con Vite (que es quien entiende
 *      `import.meta.env` y resuelve el paquete de npm en el navegador).
 *   3. Crear un archivo .env / .env.local con las variables
 *      VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example).
 *   4. Importar las funciones que necesites desde tu propio código, por
 *      ejemplo: import { createContactRequest } from './supabase-config.js'
 *
 * Mientras esto no esté conectado, el formulario de contacto sigue
 * guardando los datos en IndexedDB (ver js/script.js).
 * Guía paso a paso completa en SUPABASE_SETUP.md.
 */

// Importa el cliente oficial de Supabase desde el paquete de npm
import { createClient } from '@supabase/supabase-js'

// Lee las credenciales desde las variables de entorno de Vite.
// Si no están definidas (por ejemplo, en desarrollo sin .env), usa estos
// valores de relleno, que NO funcionan y deben reemplazarse antes de usar
// cualquier función de este archivo.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// Cliente único de Supabase, reutilizado por todas las funciones de abajo
export const supabase = createClient(supabaseUrl, supabaseKey)

// ============================================
// AUTENTICACIÓN
// Funciones para registrar usuarios, iniciar/cerrar sesión y
// consultar quién es el usuario actual y qué rol tiene (user/admin).
// ============================================

/**
 * Registrar un nuevo usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise} Datos del usuario registrado
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) console.error('Error en registro:', error)
  return { data, error }
}

/**
 * Iniciar sesión
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise} Sesión del usuario
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) console.error('Error en login:', error)
  return { data, error }
}

/**
 * Cerrar sesión
 * @returns {Promise}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) console.error('Error al cerrar sesión:', error)
  return { error }
}

/**
 * Obtener usuario actual
 * @returns {Promise} Usuario actual
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) console.error('Error obteniendo usuario:', error)
  return user
}

/**
 * Obtener rol del usuario actual
 * @returns {Promise} Rol del usuario
 */
export async function getUserRole() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (error) console.error('Error obteniendo rol:', error)
  return data?.role || 'user'
}

// ============================================
// SOLICITUDES DE CONTACTO
// CRUD para la tabla contact_requests: equivalente en Supabase a lo que
// hoy hace IndexedDB en script.js, pero compartido entre todos los
// dispositivos. Cualquiera puede crear una solicitud; solo el propio
// usuario o un admin pueden consultarlas (ver políticas RLS).
// ============================================

/**
 * Crear una solicitud de contacto
 * @param {object} contactData - Datos de contacto
 * @returns {Promise}
 */
export async function createContactRequest(contactData) {
  const { data, error } = await supabase
    .from('contact_requests')
    .insert([contactData])

  if (error) console.error('Error creando solicitud:', error)
  return { data, error }
}

/**
 * Obtener solicitudes de contacto del usuario actual
 * @returns {Promise}
 */
export async function getUserContactRequests() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .eq('email', user.email)
    .order('created_at', { ascending: false })

  if (error) console.error('Error obteniendo solicitudes:', error)
  return data
}

/**
 * Obtener todas las solicitudes (solo admin)
 * @returns {Promise}
 */
export async function getAllContactRequests() {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden ver todas las solicitudes')
    return null
  }

  const { data, error } = await supabase
    .from('contact_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('Error obteniendo solicitudes:', error)
  return data
}

/**
 * Actualizar estado de una solicitud de contacto
 * @param {string} id - ID de la solicitud
 * @param {string} status - Nuevo estado
 * @returns {Promise}
 */
export async function updateContactRequestStatus(id, status) {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden actualizar solicitudes')
    return null
  }

  const { data, error } = await supabase
    .from('contact_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) console.error('Error actualizando solicitud:', error)
  return { data, error }
}

// ============================================
// SERVICIOS
// CRUD para la tabla services: los servicios que se muestran en la
// sección "Servicios" de la página. Lectura pública; creación y
// edición restringidas a administradores.
// ============================================

/**
 * Obtener todos los servicios
 * @returns {Promise}
 */
export async function getServices() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('availability', true)
    .order('name')

  if (error) console.error('Error obteniendo servicios:', error)
  return data
}

/**
 * Crear un nuevo servicio (solo admin)
 * @param {object} serviceData - Datos del servicio
 * @returns {Promise}
 */
export async function createService(serviceData) {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden crear servicios')
    return null
  }

  const { data, error } = await supabase
    .from('services')
    .insert([serviceData])

  if (error) console.error('Error creando servicio:', error)
  return { data, error }
}

/**
 * Actualizar un servicio (solo admin)
 * @param {string} id - ID del servicio
 * @param {object} updates - Datos a actualizar
 * @returns {Promise}
 */
export async function updateService(id, updates) {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden actualizar servicios')
    return null
  }

  const { data, error } = await supabase
    .from('services')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) console.error('Error actualizando servicio:', error)
  return { data, error }
}

// ============================================
// ACTIVIDADES
// CRUD para la tabla activities (eventos programados, con fecha) y
// registro de residentes en esas actividades (activity_participants).
// ============================================

/**
 * Obtener todas las actividades
 * @returns {Promise}
 */
export async function getActivities() {
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .gte('schedule_date', new Date().toISOString().split('T')[0])
    .order('schedule_date', { ascending: true })

  if (error) console.error('Error obteniendo actividades:', error)
  return data
}

/**
 * Crear una nueva actividad (solo admin)
 * @param {object} activityData - Datos de la actividad
 * @returns {Promise}
 */
export async function createActivity(activityData) {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden crear actividades')
    return null
  }

  const { data, error } = await supabase
    .from('activities')
    .insert([activityData])

  if (error) console.error('Error creando actividad:', error)
  return { data, error }
}

/**
 * Registrarse en una actividad.
 * Requiere que el residente esté autenticado y que solo intente
 * registrarse a sí mismo (no a otro residente).
 * @param {string} activityId - ID de la actividad
 * @param {string} residentId - ID del residente
 * @returns {Promise}
 */
export async function registerForActivity(activityId, residentId) {
  const user = await getCurrentUser()
  // Corrección: si no hay sesión activa, getCurrentUser() devuelve null y
  // leer "user.id" directamente lanzaría un error. Se valida primero.
  if (!user || user.id !== residentId) {
    console.warn('Solo puedes registrarte a ti mismo')
    return null
  }

  const { data, error } = await supabase
    .from('activity_participants')
    .insert([{ activity_id: activityId, resident_id: residentId }])

  if (error) console.error('Error registrando actividad:', error)
  return { data, error }
}

// ============================================
// SOLICITUDES LOCALES
// CRUD para la tabla local_requests: peticiones internas que un residente
// ya autenticado puede hacer (por ejemplo, una solicitud de mantenimiento
// o un pedido especial), distintas del formulario público de contacto.
// ============================================

/**
 * Crear una solicitud local
 * @param {object} requestData - Datos de la solicitud
 * @returns {Promise}
 */
export async function createLocalRequest(requestData) {
  const user = await getCurrentUser()
  if (!user) {
    console.warn('Debes estar autenticado para crear una solicitud')
    return null
  }

  const { data, error } = await supabase
    .from('local_requests')
    .insert([{ ...requestData, resident_id: user.id }])

  if (error) console.error('Error creando solicitud local:', error)
  return { data, error }
}

/**
 * Obtener solicitudes locales del usuario actual
 * @returns {Promise}
 */
export async function getUserLocalRequests() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('local_requests')
    .select('*')
    .eq('resident_id', user.id)
    .order('created_at', { ascending: false })

  if (error) console.error('Error obteniendo solicitudes locales:', error)
  return data
}

/**
 * Obtener todas las solicitudes locales (solo admin)
 * @returns {Promise}
 */
export async function getAllLocalRequests() {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden ver todas las solicitudes')
    return null
  }

  const { data, error } = await supabase
    .from('local_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error('Error obteniendo solicitudes locales:', error)
  return data
}

/**
 * Actualizar estado de una solicitud local (solo admin)
 * @param {string} id - ID de la solicitud
 * @param {string} status - Nuevo estado
 * @returns {Promise}
 */
export async function updateLocalRequestStatus(id, status) {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden actualizar solicitudes')
    return null
  }

  const { data, error } = await supabase
    .from('local_requests')
    .update({
      status,
      updated_at: new Date().toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : null
    })
    .eq('id', id)

  if (error) console.error('Error actualizando solicitud:', error)
  return { data, error }
}

// ============================================
// INFORMACIÓN INSTITUCIONAL
// CRUD para la tabla institutional_info: textos/secciones editables
// (misión, visión, historia, etc.) que un admin podría actualizar sin
// tocar el código del sitio. Lectura pública, escritura solo admin.
// ============================================

/**
 * Obtener toda la información institucional
 * @returns {Promise}
 */
export async function getInstitutionalInfo() {
  const { data, error } = await supabase
    .from('institutional_info')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) console.error('Error obteniendo información:', error)
  return data
}

/**
 * Crear información institucional (solo admin)
 * @param {object} infoData - Datos de información
 * @returns {Promise}
 */
export async function createInstitutionalInfo(infoData) {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden crear información')
    return null
  }

  const { data, error } = await supabase
    .from('institutional_info')
    .insert([infoData])

  if (error) console.error('Error creando información:', error)
  return { data, error }
}

// ============================================
// RESIDENTES
// CRUD para la tabla residents: datos de cada persona mayor que vive en
// la residencia (nombre, habitación, contacto de emergencia, notas
// médicas, etc.). Acceso muy restringido por ser información sensible:
// cada residente solo ve su propio perfil; solo el admin ve y edita todos.
// ============================================

/**
 * Crear un nuevo residente (solo admin)
 * @param {object} residentData - Datos del residente
 * @returns {Promise}
 */
export async function createResident(residentData) {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden crear residentes')
    return null
  }

  const { data, error } = await supabase
    .from('residents')
    .insert([residentData])

  if (error) console.error('Error creando residente:', error)
  return { data, error }
}

/**
 * Obtener perfil del residente actual
 * @returns {Promise}
 */
export async function getResidentProfile() {
  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) console.error('Error obteniendo perfil:', error)
  return data
}

/**
 * Obtener todos los residentes (solo admin)
 * @returns {Promise}
 */
export async function getAllResidents() {
  const role = await getUserRole()
  if (role !== 'admin') {
    console.warn('Solo admins pueden ver todos los residentes')
    return null
  }

  const { data, error } = await supabase
    .from('residents')
    .select('*')
    .order('first_name')

  if (error) console.error('Error obteniendo residentes:', error)
  return data
}
