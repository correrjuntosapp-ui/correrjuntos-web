// ========================= LIGHT/DARK MODE =========================
(function() {
    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        var isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        var iconEmoji = isLight ? '\uD83C\uDF19' : '\u2600\uFE0F';
        var icon = document.getElementById('theme-icon');
        var iconLanding = document.getElementById('theme-icon-landing');
        if (icon) icon.textContent = iconEmoji;
        if (iconLanding) iconLanding.textContent = iconEmoji;
        // Actualizar aria-pressed: true = modo oscuro activo, false = modo claro
        var darkActive = isLight ? 'false' : 'true';
        document.querySelectorAll('[id^="theme-toggle-"]').forEach(function(btn) {
            btn.setAttribute('aria-pressed', darkActive);
            btn.setAttribute('aria-label', isLight ? 'Activar modo oscuro' : 'Activar modo claro');
        });
        // Actualizar tiles del mapa al cambiar tema
        if (typeof updateMapTiles === 'function') updateMapTiles();
    }

    function loadTheme() {
        var saved = localStorage.getItem('theme');
        if (saved !== 'dark') document.body.classList.add('light-mode');
        var isLight = saved !== 'dark';
        var iconEmoji = isLight ? '\uD83C\uDF19' : '\u2600\uFE0F';
        var icon = document.getElementById('theme-icon');
        var iconLanding = document.getElementById('theme-icon-landing');
        if (icon) icon.textContent = iconEmoji;
        if (iconLanding) iconLanding.textContent = iconEmoji;
        // Inicializar aria-pressed: true = modo oscuro activo
        var darkActive = isLight ? 'false' : 'true';
        document.querySelectorAll('[id^="theme-toggle-"]').forEach(function(btn) {
            btn.setAttribute('aria-pressed', darkActive);
            btn.setAttribute('aria-label', isLight ? 'Activar modo oscuro' : 'Activar modo claro');
        });
    }

    window.toggleTheme = toggleTheme;
    window.loadTheme = loadTheme;

    // Auto-init on load
    loadTheme();
})();
