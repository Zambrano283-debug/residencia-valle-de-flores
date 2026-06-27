/**
 * SCRIPT PRINCIPAL - Residencia Valle de Flores
 * ================================================
 * Gestiona toda la interactividad del sitio:
 *   1. Menú de navegación responsive (hamburguesa).
 *   2. Tabs de la sección "Actividades".
 *   3. Galería interactiva (botones con mensaje).
 *   4. Base de datos local (IndexedDB) para el formulario de contacto.
 *   5. Validación y envío del formulario de contacto.
 *   6. Botones de un panel interno de administración (legacy).
 *
 * Este archivo se carga como script normal (sin type="module"), por lo
 * que NO puede usar `import`/`export`. Es totalmente distinto y separado
 * de js/supabase-config.js, que sí usa sintaxis de módulos ES y depende
 * de un bundler (Vite) para funcionar; ese archivo todavía no está
 * conectado a esta página (ver nota más abajo, sección IndexedDB).
 */

// ========================================
// MENÚ NAVEGACIÓN (Responsive Hamburger)
// ========================================
// En pantallas angostas (ver media query en styles.css), los enlaces de
// navegación se ocultan y se reemplazan por este botón de hamburguesa.

// Selecciona el botón hamburguesa y el contenedor de enlaces de navegación.
// Ambos elementos siempre existen en el HTML, por eso no se valida null aquí.
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Al hacer click en el botón hamburguesa, alterna la clase "open" en los
// enlaces (mostrándolos u ocultándolos) y sincroniza el atributo
// aria-expanded para que lectores de pantalla anuncien el estado correcto.
menuButton.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  // Actualiza atributo ARIA para accesibilidad
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

// Si el menú está abierto y el usuario hace click en cualquier enlace
// (por ejemplo "Servicios"), cerramos el menú automáticamente para que
// no quede tapando el contenido al navegar a la sección.
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

// ========================================
// TABS DE ACTIVIDADES (Interactivos)
// ========================================
// Sección donde el usuario elige una categoría de actividad (botones .tab)
// y el contenido (título, descripción, lista e imagen) se actualiza sin
// recargar la página, leyendo los datos del objeto "activities" de abajo.

// Objeto que actúa como "base de datos" en memoria para cada actividad.
// La clave de cada entrada (fisica, cognitiva, campo, arte) debe coincidir
// exactamente con el atributo data-target de cada botón .tab en index.html.
const activities = {
  fisica: {
    title: 'Terapia física suave',
    description: 'Sesiones guiadas para conservar movilidad, equilibrio y fuerza, adaptadas al ritmo y condición de cada abuelo.',
    items: ['Estiramientos seguros', 'Ejercicios de equilibrio', 'Caminatas acompañadas'],
    // Imagen externa (Unsplash). Si se reemplaza por fotos reales, basta
    // con cambiar esta URL por la ruta local del archivo, ej: "assets/foto1.jpg"
    image: 'https://images.unsplash.com/photo-1593100126453-19b562a800c1?auto=format&fit=crop&w=1000&q=80'
  },
  cognitiva: {
    title: 'Ejercicios cognitivos',
    description: 'Actividades para estimular memoria, lenguaje, atención y orientación, siempre en un ambiente amable y motivador.',
    items: ['Juegos de memoria', 'Lectura compartida', 'Rompecabezas y asociación'],
    image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1000&q=80'
  },
  campo: {
    title: 'Paseos en el campo',
    description: 'Salidas tranquilas y acompañadas para respirar aire fresco, contemplar la naturaleza y fortalecer el ánimo.',
    items: ['Caminatas cortas', 'Jardinería terapéutica', 'Meriendas al aire libre'],
    image: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1000&q=80'
  },
  arte: {
    title: 'Arte, música y expresión',
    description: 'Espacios creativos para compartir recuerdos, emociones y talentos a través de música, pintura y manualidades.',
    items: ['Tardes musicales', 'Pintura y tejido', 'Celebraciones especiales'],
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80'
  }
};

// Referencias a los elementos del DOM que se actualizan al cambiar de tab.
// Todos existen siempre en index.html (no son condicionales).
const activityTitle = document.querySelector('#activityTitle');
const activityDescription = document.querySelector('#activityDescription');
const activityList = document.querySelector('#activityList');
const activityImage = document.querySelector('#activityImage');

// Por cada botón .tab, registramos un manejador de click que:
// 1) marca visualmente el tab activo,
// 2) busca los datos de esa actividad en el objeto "activities",
// 3) actualiza el título, descripción, imagen y lista en pantalla.
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    // Quita la clase "active" de todos los tabs antes de marcar el nuevo
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    // Marca como activo el tab que el usuario acaba de presionar
    tab.classList.add('active');

    // data-target en el HTML indica qué clave del objeto "activities" usar
    // (por ejemplo data-target="cognitiva" -> activities.cognitiva)
    const activity = activities[tab.dataset.target];

    // Actualiza el contenido dinámicamente con los datos de la actividad.
    // Se fijan también size/position/repeat (no solo la imagen) porque el
    // CSS define esas propiedades pensando en 3 capas (patrón + imagen);
    // al cambiar de tab solo queda una imagen, así que se simplifican acá
    // para que siempre se vea nítida, centrada y sin repetirse.
    activityTitle.textContent = activity.title;
    activityDescription.textContent = activity.description;
    activityImage.style.backgroundImage = `url("${activity.image}")`;
    activityImage.style.backgroundSize = 'cover';
    activityImage.style.backgroundPosition = 'center';
    activityImage.style.backgroundRepeat = 'no-repeat';
    // Convierte el array de strings en una lista de elementos <li>
    activityList.innerHTML = activity.items.map((item) => `<li>${item}</li>`).join('');
  });
});

// ========================================
// GALERÍA (Interactiva)
// ========================================
// Cada botón de la galería (.gallery-item) trae un atributo data-message
// con un texto descriptivo. Al hacer click, ese texto se muestra en el
// párrafo #galleryMessage, simulando "seleccionar" esa faceta del hogar.

const galleryMessage = document.querySelector('#galleryMessage');

// Registra un listener de click en cada botón de la galería
document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    // Toma el texto guardado en data-message y lo muestra en pantalla
    galleryMessage.textContent = item.dataset.message;
  });
});

// ========================================
// BASE DE DATOS (IndexedDB)
// ========================================
// IndexedDB es una base de datos integrada en el navegador: cada visitante
// guarda sus propias solicitudes solo en SU navegador/dispositivo, sin
// compartirlas con nadie más. Es útil para que la demo funcione sin backend,
// pero NO sirve para que el equipo de la residencia vea, en un solo lugar,
// las solicitudes que llegan desde distintos celulares o computadores.
//
// Por eso el proyecto incluye además js/supabase-config.js y las migraciones
// SQL en supabase/migrations/: esa es la ruta para tener una base de datos
// real y compartida (ver SUPABASE_SETUP.md). Mientras esa integración no
// esté conectada al formulario, el código de abajo (IndexedDB) sigue siendo
// el que efectivamente guarda los datos del formulario de contacto.
// ========================================

const databaseName = 'residenciaValleFloresDB';
const databaseVersion = 2;
const storeName = 'contactos';

/**
 * Abre o crea la base de datos IndexedDB
 * @returns {Promise<IDBDatabase>} Promesa que resuelve con la instancia de BD
 */
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    // Se ejecuta cuando se necesita actualizar la estructura de BD
    request.addEventListener('upgradeneeded', () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        // Crea un almacén de objetos para guardar contactos
        const store = database.createObjectStore(storeName, {
          keyPath: 'id',
          autoIncrement: true
        });
        // Crea índice por fecha de creación
        store.createIndex('creadoEn', 'creadoEn');
      }
    });

    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error));
  });
}

/**
 * Guarda un contacto en la base de datos
 * @param {Object} contact - Objeto con datos del contacto
 * @returns {Promise<number>} Promesa que resuelve con el ID del contacto guardado
 */
async function saveContact(contact) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    // Añade timestamp de creación
    const request = store.add({
      ...contact,
      creadoEn: new Date().toLocaleString('es-CO')
    });

    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error));
    transaction.addEventListener('complete', () => database.close());
  });
}

/**
 * Obtiene todos los contactos de la base de datos
 * @returns {Promise<Array>} Promesa que resuelve con array de contactos
 */
async function getContacts() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.addEventListener('success', () => {
      // Ordena por ID descendente (más recientes primero)
      resolve(request.result.sort((a, b) => b.id - a.id));
    });
    request.addEventListener('error', () => reject(request.error));
    transaction.addEventListener('complete', () => database.close());
  });
}

/**
 * Borra todos los contactos de la base de datos
 * @returns {Promise<void>}
 */
async function clearContacts() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.addEventListener('success', () => resolve());
    request.addEventListener('error', () => reject(request.error));
    transaction.addEventListener('complete', () => database.close());
  });
}

/**
 * Escapa caracteres HTML especiales para evitar inyecciones (XSS).
 * Se usa antes de insertar cualquier dato del usuario dentro de innerHTML
 * (ver renderContacts), porque si alguien escribiera, por ejemplo,
 * "<script>" en el campo de mensaje, sin este escape ese texto podría
 * ejecutarse como código en el navegador de quien vea el panel.
 * @param {string} value - Valor a escapar
 * @returns {string} Valor escapado y seguro para insertar como HTML
 */
function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Renderiza los contactos en una tabla HTML
 * @param {Array} contacts - Array de contactos a mostrar
 */
function renderContacts(contacts) {
  const recordsList = document.querySelector('#recordsList');

  if (!recordsList) return; // Si no existe el elemento, salir

  if (!contacts.length) {
    recordsList.innerHTML = '<p class="empty-records">Aún no hay solicitudes guardadas.</p>';
    return;
  }

  // Genera tabla HTML con todos los contactos
  recordsList.innerHTML = `
    <table class="records-table">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>Correo</th>
          <th>Consulta</th>
          <th>Mensaje</th>
        </tr>
      </thead>
      <tbody>
        ${contacts.map((contact) => `
          <tr>
            <td>${escapeHtml(contact.creadoEn)}</td>
            <td>${escapeHtml(contact.nombre)}</td>
            <td>${escapeHtml(contact.telefono)}</td>
            <td>${escapeHtml(contact.correo || 'No registrado')}</td>
            <td>${escapeHtml(contact.consulta || 'No registrada')}</td>
            <td>${escapeHtml(contact.mensaje || 'Sin mensaje adicional')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/**
 * Valida los datos del formulario
 * @param {HTMLFormElement} form - Elemento del formulario a validar
 * @returns {string} Mensaje de error (vacío si es válido)
 */
function validateForm(form) {
  const nombre = form.nombre.value.trim();
  const telefono = form.telefono.value.trim();
  const correo = form.correo.value.trim();
  const consulta = form.consulta.value.trim();

  // Validaciones
  if (nombre.length < 3) {
    return 'Escribe un nombre de al menos 3 caracteres.';
  }

  if (!/^[0-9+()\s-]{7,20}$/.test(telefono)) {
    return 'Escribe un teléfono válido.';
  }

  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    return 'Escribe un correo electrónico válido.';
  }

  if (!consulta) {
    return 'Selecciona el tipo de consulta.';
  }

  return ''; // Sin errores
}

/**
 * Descarga los contactos en formato CSV
 * @param {Array} contacts - Array de contactos a descargar
 */
function downloadCsv(contacts) {
  if (!contacts.length) {
    renderContacts([]);
    return;
  }

  const headers = ['Fecha', 'Nombre', 'Teléfono', 'Correo', 'Consulta', 'Mensaje'];
  const rows = contacts.map((contact) => [
    contact.creadoEn,
    contact.nombre,
    contact.telefono,
    contact.correo || '',
    contact.consulta || '',
    contact.mensaje || ''
  ]);
  
  // Convierte a formato CSV
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  
  // Crea blob y descarga
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'solicitudes-valle-de-flores.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

// ========================================
// MANEJO DEL FORMULARIO DE CONTACTO
// ========================================

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('button[type="submit"]');
    const validationMessage = validateForm(form);

    // Muestra error si hay validación fallida
    status.classList.toggle('error', Boolean(validationMessage));
    if (validationMessage) {
      status.textContent = validationMessage;
      return;
    }

    // Deshabilita botón y muestra estado
    status.textContent = 'Enviando solicitud...';
    submitButton.disabled = true;

    try {
      // Guarda el contacto en la BD
      await saveContact({
        nombre: form.nombre.value.trim(),
        telefono: form.telefono.value.trim(),
        correo: form.correo.value.trim(),
        consulta: form.consulta.value.trim(),
        mensaje: form.mensaje.value.trim()
      });

      // Muestra éxito
      status.classList.remove('error');
      status.textContent = 'Gracias. Tu solicitud quedó guardada correctamente.';
      form.reset(); // Limpia el formulario
      renderContacts(await getContacts()); // Actualiza tabla de registros
    } catch (error) {
      // Muestra error
      status.classList.add('error');
      status.textContent = 'No se pudo guardar. Revisa los permisos del navegador.';
    } finally {
      submitButton.disabled = false;
    }
  });
}

// ========================================
// BOTONES DE PANEL INTERNO (LEGACY / INACTIVO)
// ========================================
// El HTML actual (index.html) ya NO incluye los botones #loadRecords,
// #exportRecords ni #clearRecords, ni el contenedor #recordsList (fueron
// retirados al quitar el panel interno de la página, ver el comentario
// correspondiente en index.html). Por eso, document.querySelector() para
// estos IDs siempre devuelve null en el sitio actual, y los bloques "if"
// de abajo nunca llegan a ejecutarse: este código queda inactivo sin
// causar errores. Se conserva por si se vuelve a agregar un panel de
// administración en el futuro (por ejemplo, conectado a Supabase).

// Botón "Cargar registros guardados": vuelve a leer todos los contactos
// de IndexedDB y los dibuja en la tabla (#recordsList).
const loadRecordsBtn = document.querySelector('#loadRecords');
if (loadRecordsBtn) {
  loadRecordsBtn.addEventListener('click', async () => {
    renderContacts(await getContacts());
  });
}

// Botón "Exportar como CSV": descarga todos los contactos guardados
// como un archivo .csv que se puede abrir en Excel/Sheets.
const exportRecordsBtn = document.querySelector('#exportRecords');
if (exportRecordsBtn) {
  exportRecordsBtn.addEventListener('click', async () => {
    downloadCsv(await getContacts());
  });
}

// Botón "Borrar todos los registros": pide confirmación antes de vaciar
// por completo la base de datos local de contactos.
const clearRecordsBtn = document.querySelector('#clearRecords');
if (clearRecordsBtn) {
  clearRecordsBtn.addEventListener('click', async () => {
    const confirmed = window.confirm('¿Deseas borrar todas las solicitudes guardadas en este navegador?');
    if (!confirmed) return;

    await clearContacts();
    renderContacts([]);
  });
}
