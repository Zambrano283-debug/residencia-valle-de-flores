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

// --- SECCIÓN DE ACTIVIDADES E IMÁGENES ---
const activities = {
  fisica: {
    title: 'Terapia física suave',
    description: 'Sesiones guiadas para conservar movilidad, equilibrio y fuerza, adaptadas al ritmo y condición de cada abuelo.',
    items: ['Estiramientos seguros', 'Ejercicios de equilibrio', 'Caminatas acompañadas'],
    image: 'assets/actividad-fisica.jpg'
  },
  cognitiva: {
    title: 'Ejercicios cognitivos',
    description: 'Actividades para estimular memoria, lenguaje, atención y orientación, siempre en un ambiente amable y motivador.',
    items: ['Juegos de memoria', 'Lectura compartida', 'Rompecabezas y asociación'],
    image: 'assets/actividad-cognitiva.jpg'
  },
  campo: {
    title: 'Paseos en el campo',
    description: 'Salidas tranquilas y acompañadas para respirar aire fresco, contemplar la naturaleza y fortalecer el ánimo.',
    items: ['Caminatas cortas', 'Jardinería terapéutica', 'Meriendas al aire libre'],
    image: 'assets/actividad-campo.jpg'
  },
  arte: {
    title: 'Arte, música y expresión',
    description: 'Espacios creativos para compartir recuerdos, emociones y talentos a través de música, pintura y manualidades.',
    items: ['Tardes musicales', 'Pintura y tejido', 'Celebraciones especiales'],
    image: 'assets/actividad-arte.jpg'
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

    const targetKey = tab.dataset.target;
    const activity = activities[targetKey];

    if (activity) {
      activityTitle.textContent = activity.title;
      activityDescription.textContent = activity.description;
      activityImage.style.backgroundImage = `url("${activity.image}")`;
      activityList.innerHTML = activity.items.map((item) => `<li>${item}</li>`).join('');
    }
  });
});

// Lógica del formulario de contacto
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('button[type="submit"]');

    status.textContent = 'Enviando solicitud...';
    submitButton.disabled = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      status.classList.remove('error');
      status.textContent = '¡Listo! Los datos están preparados para el servidor.';
      form.reset();
    } catch (error) {
      status.classList.add('error');
      status.textContent = 'Ocurrió un error al preparar los datos.';
    } finally {
      submitButton.disabled = false;
    }
  });
}

// Botón "Volver arriba"
const btnVolverArriba = document.getElementById('btnVolverArriba');
if (btnVolverArriba) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btnVolverArriba.classList.add('mostrar');
    } else {
      btnVolverArriba.classList.remove('mostrar');
    }
  });

  btnVolverArriba.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}