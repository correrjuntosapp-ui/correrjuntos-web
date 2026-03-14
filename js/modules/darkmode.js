// ========================= LIGHT/DARK MODE =========================
(function() {
    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        var isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        var iconEmoji = isLight ? '\uD83C\uDF19' : '\u2600\uFE0F';
        var iconProfile = document.getElementById('theme-icon-profile');
        if (iconProfile) iconProfile.textContent = iconEmoji;
        // Actualizar toggle switch visual
        var toggleSwitch = document.getElementById('theme-toggle-profile');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('aria-pressed', isLight ? 'false' : 'true');
            var dot = toggleSwitch.querySelector('.toggle-dot');
            if (dot) dot.style.transform = isLight ? 'translateX(0)' : 'translateX(20px)';
            var bg = toggleSwitch.querySelector('.toggle-bg');
            if (bg) bg.style.background = isLight ? '#475569' : '#f97316';
        }
        // Actualizar tiles del mapa al cambiar tema
        if (typeof updateMapTiles === 'function') updateMapTiles();
    }

    function loadTheme() {
        var saved = localStorage.getItem('theme');
        if (saved !== 'dark') document.body.classList.add('light-mode');
        var isLight = saved !== 'dark';
        var iconEmoji = isLight ? '\uD83C\uDF19' : '\u2600\uFE0F';
        var iconProfile = document.getElementById('theme-icon-profile');
        if (iconProfile) iconProfile.textContent = iconEmoji;
        var toggleSwitch = document.getElementById('theme-toggle-profile');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('aria-pressed', isLight ? 'false' : 'true');
            var dot = toggleSwitch.querySelector('.toggle-dot');
            if (dot) dot.style.transform = isLight ? 'translateX(0)' : 'translateX(20px)';
            var bg = toggleSwitch.querySelector('.toggle-bg');
            if (bg) bg.style.background = isLight ? '#475569' : '#f97316';
        }
    }

    window.toggleTheme = toggleTheme;
    window.loadTheme = loadTheme;

    // Auto-init on load
    loadTheme();
})();
