// ========================= CONFETTI CELEBRATION =========================
(function() {
    function showConfetti() {
        var container = document.createElement('div');
        container.className = 'confetti-container';
        document.body.appendChild(container);

        var colors = ['#f97316', '#ea580c', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#facc15'];
        var shapes = ['square', 'circle'];

        for (var i = 0; i < 80; i++) {
            var confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            if (shapes[Math.floor(Math.random() * shapes.length)] === 'circle') {
                confetti.style.borderRadius = '50%';
            }
            container.appendChild(confetti);
        }

        setTimeout(function() { container.remove(); }, 4000);
    }

    window.showConfetti = showConfetti;
    window.triggerConfetti = showConfetti; // Alias — 4 call sites use this name
})();
