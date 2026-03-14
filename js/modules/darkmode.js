// ========================= LIGHT/DARK MODE =========================
(function() {
    var moonSvg = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>';
    var sunSvg = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>';

    function updateIcon(isLight) {
        var iconProfile = document.getElementById('theme-icon-profile');
        if (iconProfile) iconProfile.innerHTML = isLight ? moonSvg : sunSvg;
    }

    function toggleTheme() {
        document.body.classList.toggle('light-mode');
        var isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        updateIcon(isLight);
        var toggleSwitch = document.getElementById('theme-toggle-profile');
        if (toggleSwitch) {
            toggleSwitch.setAttribute('aria-pressed', isLight ? 'false' : 'true');
            var dot = toggleSwitch.querySelector('.toggle-dot');
            if (dot) dot.style.transform = isLight ? 'translateX(0)' : 'translateX(20px)';
            var bg = toggleSwitch.querySelector('.toggle-bg');
            if (bg) bg.style.background = isLight ? '#475569' : '#f97316';
        }
        if (typeof updateMapTiles === 'function') updateMapTiles();
    }

    function loadTheme() {
        var saved = localStorage.getItem('theme');
        if (saved !== 'dark') document.body.classList.add('light-mode');
        var isLight = saved !== 'dark';
        updateIcon(isLight);
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
