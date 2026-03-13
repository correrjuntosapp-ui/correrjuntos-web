// ========================= SKELETON LOADERS =========================
(function() {
    function showSkeletons(containerId, count) {
        if (count === undefined) count = 3;
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = Array(count).fill(0).map(function() {
            return '<div class="skeleton skeleton-card p-6 rounded-3xl">' +
                '<div class="flex justify-between mb-4">' +
                    '<div class="skeleton skeleton-text" style="width:120px;"></div>' +
                    '<div class="skeleton skeleton-text" style="width:60px;"></div>' +
                '</div>' +
                '<div class="skeleton skeleton-text" style="width:80%;"></div>' +
                '<div class="skeleton skeleton-text-sm" style="width:50%;"></div>' +
                '<div class="flex gap-2 mt-4">' +
                    '<div class="skeleton skeleton-avatar"></div>' +
                    '<div class="skeleton skeleton-avatar"></div>' +
                '</div>' +
            '</div>';
        }).join('');
    }

    window.showSkeletons = showSkeletons;
})();
