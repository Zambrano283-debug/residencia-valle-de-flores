const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuButton.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const activities = {
  fisica: {
    title: 'Terapia física suave',
    description: 'Sesiones guiadas para conservar movilidad, equilibrio y fuerza, adaptadas al ritmo y condición de cada abuelo.',
    items: ['Estiramientos seguros', 'Ejercicios de equilibrio', 'Caminatas acompañadas'],
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

const activityTitle = document.querySelector('#activityTitle');
const activityDescription = document.querySelector('#activityDescription');
const activityList = document.querySelector('#activityList');
const activityImage = document.querySelector('#activityImage');

document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');

    const activity = activities[tab.dataset.target];
    activityTitle.textContent = activity.title;
    activityDescription.textContent = activity.description;
    activityImage.style.backgroundImage = `url("${activity.image}")`;
    activityList.innerHTML = activity.items.map((item) => `<li>${item}</li>`).join('');
  });
});

const galleryMessage = document.querySelector('#galleryMessage');
document.querySelectorAll('.gallery-item').forEach((item) => {
  item.addEventListener('click', () => {
    galleryMessage.textContent = item.dataset.message;
  });
});

const databaseName = 'residenciaValleFloresDB';
const databaseVersion = 2;
const storeName = 'contactos';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, databaseVersion);

    request.addEventListener('upgradeneeded', () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(storeName)) {
        const store = database.createObjectStore(storeName, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('creadoEn', 'creadoEn');
      }
    });

    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error));
  });
}

async function saveContact(contact) {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add({
      ...contact,
      creadoEn: new Date().toLocaleString('es-CO')
    });

    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('error', () => reject(request.error));
    transaction.addEventListener('complete', () => database.close());
  });
}

async function getContacts() {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.addEventListener('success', () => {
      resolve(request.result.sort((a, b) => b.id - a.id));
    });
    request.addEventListener('error', () => reject(request.error));
    transaction.addEventListener('complete', () => database.close());
  });
}

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

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderContacts(contacts) {
  const recordsList = document.querySelector('#recordsList');

  if (!contacts.length) {
    recordsList.innerHTML = '<p class="empty-records">Aún no hay solicitudes guardadas.</p>';
    return;
  }

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

function validateForm(form) {
  const nombre = form.nombre.value.trim();
  const telefono = form.telefono.value.trim();
  const correo = form.correo.value.trim();
  const consulta = form.consulta.value.trim();

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

  return '';
}

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
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const link = document.createElement('a');

  link.href = URL.createObjectURL(blob);
  link.download = 'solicitudes-valle-de-flores.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

document.querySelector('.contact-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('.form-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const validationMessage = validateForm(form);

  status.classList.toggle('error', Boolean(validationMessage));
  if (validationMessage) {
    status.textContent = validationMessage;
    return;
  }

  status.textContent = 'Enviando solicitud...';
  submitButton.disabled = true;

  try {
    await saveContact({
      nombre: form.nombre.value.trim(),
      telefono: form.telefono.value.trim(),
      correo: form.correo.value.trim(),
      consulta: form.consulta.value.trim(),
      mensaje: form.mensaje.value.trim()
    });

    status.classList.remove('error');
    status.textContent = 'Gracias. Tu solicitud quedó guardada correctamente.';
    form.reset();
    renderContacts(await getContacts());
  } catch (error) {
    status.classList.add('error');
    status.textContent = 'No se pudo guardar. Revisa los permisos del navegador.';
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector('#loadRecords').addEventListener('click', async () => {
  renderContacts(await getContacts());
});

document.querySelector('#exportRecords').addEventListener('click', async () => {
  downloadCsv(await getContacts());
});

document.querySelector('#clearRecords').addEventListener('click', async () => {
  const confirmed = window.confirm('¿Deseas borrar todas las solicitudes guardadas en este navegador?');
  if (!confirmed) return;

  await clearContacts();
  renderContacts([]);
});
