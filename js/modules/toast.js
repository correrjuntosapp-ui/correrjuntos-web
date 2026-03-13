// ========================= TOAST (Material Design) =========================
(function() {
    function showToast(msg, type = 'success', duration = 4000) {
        // Crear contenedor si no existe
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        // Iconos mejorados por tipo
        const icons = {
            success: '\u2705',
            error: '\u274C',
            info: '\u2139\uFE0F',
            warning: '\u26A0\uFE0F'
        };

        // Crear el toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconSpan = document.createElement('span');
        iconSpan.className = 'toast-icon';
        iconSpan.textContent = icons[type] || '\u2705';

        const msgSpan = document.createElement('span');
        msgSpan.className = 'toast-message';
        msgSpan.textContent = msg;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.textContent = '\u2715';
        closeBtn.onclick = function() { toast.remove(); };

        toast.appendChild(iconSpan);
        toast.appendChild(msgSpan);
        toast.appendChild(closeBtn);

        // Añadir al contenedor
        container.appendChild(toast);

        // Auto-dismiss
        setTimeout(function() {
            toast.classList.add('fade-out');
            setTimeout(function() { toast.remove(); }, 300);
        }, duration);

        // También actualizar el toast antiguo por compatibilidad
        var oldToast = document.getElementById('toast');
        var oldContent = document.getElementById('toast-content');
        if (oldToast && oldContent) {
            var colors = {success:'bg-green-500',error:'bg-red-500',info:'bg-blue-500',warning:'bg-yellow-500'};
            var bg = colors[type] || 'bg-green-500';
            oldContent.className = 'px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 ' + bg + ' text-white';
            oldContent.textContent = (icons[type] || '\u2705') + ' ' + msg;
            oldToast.classList.remove('hidden');
            setTimeout(function() { oldToast.classList.add('hidden'); }, duration);
        }
    }

    window.showToast = showToast;
})();
