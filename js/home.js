/* Preview home v3 — menú móvil, selector de deporte del blog y galería de pantallas.
   Todas las secciones funcionan sin este script (enlaces reales, dos colecciones visibles,
   FAQ con <details>); aquí solo se añaden comodidades. Cada bloque comprueba que sus
   elementos existen antes de actuar. */
(function () {
  const menuButton = document.querySelector('.menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuButton && mobileMenu) {
    const closeMenu = () => {
      mobileMenu.hidden = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menú');
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      mobileMenu.hidden = !open;
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    mobileMenu.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.hidden) {
        closeMenu();
        menuButton.focus();
      }
    });
    if (window.matchMedia) {
      const mq = window.matchMedia('(min-width: 900px)');
      if (mq.addEventListener) mq.addEventListener('change', closeMenu);
    }
  }

  const sportButtons = Array.from(document.querySelectorAll('[data-sport]'));
  if (sportButtons.length) {
    const showSport = (sport) => {
      for (const button of sportButtons) {
        const active = button.dataset.sport === sport;
        button.setAttribute('aria-pressed', String(active));
        const panel = document.getElementById(button.getAttribute('aria-controls'));
        if (panel) panel.hidden = !active;
      }
    };
    for (const button of sportButtons) {
      button.addEventListener('click', () => showSport(button.dataset.sport));
    }
    showSport('running');
  }
  document.documentElement.classList.add('js-ready');

  const screens = {
    '01-inicio': { caption: '01 — Tu próximo paso', height: 1560, alt: 'Inicio de Android 1.3.30: día de descanso del plan, semana en curso, Salir a correr y próxima sesión de fuerza; cuenta de pruebas' },
    '02-plan': { caption: '02 — Tu plan gratuito, organizado', height: 1560, alt: 'Mi semana en Android 1.3.30: plan Empezar a correr (0→5K), semana 1 de 8, calendario y próxima sesión Caminar/Correr 5x2min; cuenta de pruebas' },
    '03-sesion': { caption: '03 — Cada sesión, paso a paso', height: 1560, alt: 'Sesión Caminar/Correr 5x2min de la semana 2: 23 minutos, calentamiento, cinco bloques de dos minutos corriendo y minuto y medio caminando, y enfriamiento' },
    '04-fuerza': { caption: '04 — Fuerza para tu semana', height: 1560, alt: 'Fuerza en Android 1.3.30: próxima sesión Glúteos y estabilidad, semana de fuerza y explorador de sesiones con filtros; cuenta de pruebas' },
    '05-carreras': { caption: '05 — Encuentra tu próxima carrera', height: 1560, alt: 'Mapa y listado de carreras en España en Android 1.3.30, con fechas y distancias; pestaña Carreras seleccionada' }
  };
  const screenButtons = Array.from(document.querySelectorAll('[data-screen]'));
  const preview = document.getElementById('app-screen');
  const full = document.getElementById('full-screen');
  const captionEl = document.getElementById('screen-caption');
  if (screenButtons.length && preview && full && captionEl) {
    const captionTitle = captionEl.querySelector('strong');
    const captionDesc = captionEl.querySelector('span');
    const choices = document.querySelector('.screen-choices');
    const position = document.getElementById('screen-position');
    const dialog = document.querySelector('.screen-dialog');
    const dialogImage = document.getElementById('dialog-screen');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogPosition = document.getElementById('dialog-position');
    const expand = document.getElementById('expand-screen');
    let activeIndex = 0;
    let returnFocus = full;
    const updateDialog = () => {
      dialogImage.src = preview.src;
      dialogImage.alt = preview.alt;
      dialogImage.height = preview.height;
      dialogTitle.textContent = captionTitle.textContent;
      dialogPosition.textContent = (activeIndex + 1) + ' / ' + screenButtons.length;
    };
    const selectScreen = (index) => {
      activeIndex = (index + screenButtons.length) % screenButtons.length;
      const button = screenButtons[activeIndex];
      const selected = button.dataset.screen;
      const screen = screens[selected];
      if (!screen) return;
      const src = '/public/home/app/v13/native-' + selected + '-720.webp';
      preview.src = src;
      preview.height = screen.height;
      preview.alt = screen.alt;
      full.href = src;
      full.setAttribute('aria-label', 'Ampliar pantalla: ' + screen.caption);
      const small = button.querySelector('small');
      if (captionTitle) captionTitle.textContent = screen.caption; else captionEl.textContent = screen.caption;
      if (captionDesc) captionDesc.textContent = small ? small.textContent : '';
      if (position) position.textContent = (activeIndex + 1) + ' / ' + screenButtons.length;
      for (const other of screenButtons) other.setAttribute('aria-pressed', String(other === button));
      if (choices && choices.scrollWidth > choices.clientWidth) {
        const left = choices.scrollLeft + button.getBoundingClientRect().left - choices.getBoundingClientRect().left - (choices.clientWidth - button.offsetWidth) / 2;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        choices.scrollTo({ left, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      if (dialog && dialog.open) updateDialog();
    };
    for (const button of screenButtons) {
      button.addEventListener('click', () => selectScreen(screenButtons.indexOf(button)));
    }
    for (const link of document.querySelectorAll('[data-tour-screen]')) {
      link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        const button = screenButtons.find(candidate => candidate.dataset.screen === link.dataset.tourScreen);
        if (!button) return;
        event.preventDefault();
        button.click();
        full.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        full.focus({ preventScroll: true });
      });
    }
    if (dialog && typeof dialog.showModal === 'function' && dialogImage && dialogTitle && dialogPosition && expand && captionTitle) {
      const openDialog = (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        returnFocus = event.currentTarget;
        updateDialog();
        document.documentElement.classList.add('screen-dialog-open');
        dialog.showModal();
      };
      full.addEventListener('click', openDialog);
      full.setAttribute('aria-haspopup', 'dialog');
      expand.addEventListener('click', openDialog);
      expand.setAttribute('aria-haspopup', 'dialog');
      document.getElementById('close-screen').addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('screen-dialog-open');
        returnFocus.focus({ preventScroll: true });
      });
      dialog.addEventListener('click', (event) => {
        const bounds = dialog.getBoundingClientRect();
        if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
      });
      dialog.addEventListener('keydown', (event) => {
        if (event.key === 'Tab') {
          const focusable = [...dialog.querySelectorAll('button:not([disabled])')];
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault();
          selectScreen(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
      });
      for (const button of document.querySelectorAll('[data-gallery-step], [data-dialog-step]')) {
        button.addEventListener('click', () => selectScreen(activeIndex + Number(button.dataset.galleryStep || button.dataset.dialogStep)));
      }
      document.querySelector('.screen-tools').hidden = false;
    }
  }
})();

(function () {
  const form = document.getElementById('newsletterForm');
  const message = document.getElementById('newsletterMsg');
  if (!form || !message) return;
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    const email = form.querySelector('[name="email"]').value.trim();
    const button = form.querySelector('button');
    if (!email || button.disabled) return;
    button.disabled = true;
    button.textContent = 'Enviando…';
    message.hidden = true;
    delete message.dataset.error;
    try {
      const response = await fetch('/api/brevo-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, lang: 'es', source: 'lead-magnet-10k-home', lead_magnet: 'plan-10k-preview' })
      });
      if (!response.ok && response.status !== 409) throw new Error('Subscription failed');
      if (response.status !== 409 && localStorage.getItem('cj_cookie_consent') === 'accepted') {
        if (typeof window.gtag === 'function') window.gtag('event', 'lead_magnet_signup', { lead_magnet: 'plan-10k-preview', location: 'homepage', duplicate: response.status === 409 });
        if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Plan 10K Preview' });
      }
      form.hidden = true;
      message.hidden = false;
      if (response.status === 409) {
        message.textContent = 'Ya estabas suscrito/a. ';
        const download = document.createElement('a');
        download.href = '/blog/descarga-plan-10k';
        download.textContent = 'Descargar Plan 10K (PDF) →';
        message.appendChild(download);
      } else {
        message.textContent = 'Llevándote a tu descarga…';
        setTimeout(function () { window.location.href = '/blog/descarga-plan-10k/'; }, 600);
      }
    } catch {
      message.hidden = false;
      message.dataset.error = 'true';
      message.textContent = 'No se pudo enviar. Inténtalo de nuevo.';
      button.disabled = false;
      button.textContent = 'Quiero mi plan →';
    }
  });
})();
