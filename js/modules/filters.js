// ========================= FILTERS MODULE =========================
// Advanced filter pills, desktop filters, alert preferences.
// Loaded AFTER state.js, ui.js.
(function() {
    'use strict';

    let filtersVisible = false;
    let activeFilters = { nivel: null, horario: null, distancia: null, ritmo: null, verificado: null, premium_org: null };

    function toggleAdvancedFilters() {
        filtersVisible = !filtersVisible;
        const panel = document.getElementById('filters-panel');
        const icon = document.getElementById('toggle-filters-icon');
        const text = document.getElementById('toggle-filters-text');
        if (panel) panel.classList.toggle('hidden', !filtersVisible);
        if (icon) icon.style.transform = filtersVisible ? 'rotate(180deg)' : '';
        if (text) text.textContent = filtersVisible ? 'Menos filtros' : 'Más filtros';
    }

    function initFilterPills() {
        document.querySelectorAll('.filter-pill').forEach(pill => {
            pill.setAttribute('aria-pressed', 'false');
            pill.addEventListener('click', () => {
                const filterType = pill.dataset.filter;
                const value = pill.dataset.value;

                // Toggle selection
                if (activeFilters[filterType] === value) {
                    activeFilters[filterType] = null;
                    pill.classList.remove('active');
                    pill.setAttribute('aria-pressed', 'false');
                } else {
                    // Deselect others in same group
                    document.querySelectorAll(`.filter-pill[data-filter="${filterType}"]`).forEach(p => {
                        p.classList.remove('active');
                        p.setAttribute('aria-pressed', 'false');
                    });
                    activeFilters[filterType] = value;
                    pill.classList.add('active');
                    pill.setAttribute('aria-pressed', 'true');
                }

                updateFilterUI();
                renderQuedadas();
            });
        });
    }

    function updateFilterUI() {
        const count = Object.values(activeFilters).filter(v => v !== null).length;
        const countEl = document.getElementById('active-filters-count');
        const clearBtn = document.getElementById('btn-clear-filters');
        const clearBtnDesktop = document.getElementById('btn-clear-filters-desktop');
        const saveAlertBtn = document.getElementById('btn-save-alert');
        const resultCount = document.getElementById('filter-result-count');

        if (countEl) {
            countEl.textContent = count;
            countEl.classList.toggle('hidden', count === 0);
        }
        if (clearBtn) clearBtn.classList.toggle('hidden', count === 0);
        if (clearBtnDesktop) clearBtnDesktop.classList.toggle('hidden', count === 0);
        if (saveAlertBtn) saveAlertBtn.classList.toggle('hidden', count === 0);

        // Actualizar contador de resultados en sidebar
        if (resultCount) {
            const filtered = quedadas.filter(q => !isQuedadaPasada(q));
            const withFilters = applyAdvancedFilters(filtered);
            resultCount.textContent = withFilters.length;
        }
    }

    function initDesktopFilters() {
        const container = document.getElementById('desktop-filters-content');
        if (!container) return;

        container.innerHTML = `
            <!-- Horario -->
            <div class="filter-group">
                <label class="text-sm font-semibold text-gray-300 mb-2 block"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Horario</label>
                <div class="grid grid-cols-3 gap-2" role="group" aria-label="Filtro por horario">
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="horario" data-value="manana"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg> Mañana</button>
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="horario" data-value="tarde"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg> Tarde</button>
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="horario" data-value="noche"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg> Noche</button>
                </div>
            </div>

            <!-- Nivel -->
            <div class="filter-group">
                <label class="text-sm font-semibold text-gray-300 mb-2 block"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> Nivel</label>
                <div class="grid grid-cols-2 gap-2" role="group" aria-label="Filtro por nivel">
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="nivel" data-value="Principiante"><span style="width:8px;height:8px;border-radius:50%;background:#22c55e;display:inline-block"></span> Principiante</button>
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="nivel" data-value="Intermedio"><span style="width:8px;height:8px;border-radius:50%;background:#eab308;display:inline-block"></span> Intermedio</button>
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="nivel" data-value="Avanzado"><span style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block"></span> Avanzado</button>
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="nivel" data-value="Elite"><span style="width:8px;height:8px;border-radius:50%;background:#8b5cf6;display:inline-block"></span> Elite</button>
                </div>
            </div>

            <!-- Distancia -->
            <div class="filter-group">
                <label class="text-sm font-semibold text-gray-300 mb-2 block"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg> Distancia</label>
                <div class="grid grid-cols-3 gap-2" role="group" aria-label="Filtro por distancia">
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="distancia" data-value="corta"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg> Corta</button>
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="distancia" data-value="media"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Media</button>
                    <button class="filter-pill-desktop" aria-pressed="false" data-filter="distancia" data-value="larga"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg> Larga</button>
                </div>
            </div>

            <!-- Premium filters teaser -->
            <div class="filter-group pt-4 border-t border-slate-700/50 ${isUserPremium ? 'hidden' : ''}">
                <div class="flex items-center justify-between mb-2">
                    <label class="text-sm font-semibold text-yellow-400 flex items-center gap-1"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Filtros Premium</label>
                </div>
                <div class="text-xs text-gray-500 mb-3">Ritmo exacto, organizador verificado...</div>
                <button onclick="openPremiumSales()" class="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold hover:border-yellow-500/50 transition">
                    Desbloquear <svg style="width:14px;height:14px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                </button>
            </div>

            <!-- Premium filters (si es premium) -->
            <div id="premium-filters-desktop" class="${isUserPremium ? '' : 'hidden'} pt-4 border-t border-yellow-500/30">
                <label class="text-sm font-semibold text-yellow-400 mb-2 block flex items-center gap-1"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Filtros Premium</label>
                <div class="space-y-3">
                    <div>
                        <span class="text-xs text-gray-400">Ritmo</span>
                        <div class="grid grid-cols-3 gap-1 mt-1" role="group" aria-label="Filtro por ritmo">
                            <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="ritmo" data-value="lento"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg> Lento</button>
                            <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="ritmo" data-value="moderado"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg> Mod.</button>
                            <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="ritmo" data-value="rapido"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> Rápido</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2" role="group" aria-label="Filtros premium adicionales">
                        <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="verificado" data-value="true"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> Verificado</button>
                        <button class="filter-pill-desktop filter-pill-premium" aria-pressed="false" data-filter="premium_org" data-value="true"><svg style="width:16px;height:16px;display:inline-block;vertical-align:middle" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg> Premium</button>
                    </div>
                </div>
            </div>
        `;

        // Añadir event listeners a los nuevos pills
        container.querySelectorAll('.filter-pill-desktop').forEach(pill => {
            pill.addEventListener('click', () => {
                const filterType = pill.dataset.filter;
                const value = pill.dataset.value;

                // Toggle selection
                if (activeFilters[filterType] === value) {
                    activeFilters[filterType] = null;
                    pill.classList.remove('active');
                    pill.setAttribute('aria-pressed', 'false');
                    // También deseleccionar en los filtros móviles
                    document.querySelectorAll(`.filter-pill[data-filter="${filterType}"][data-value="${value}"]`).forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
                } else {
                    // Deselect others in same group
                    container.querySelectorAll(`.filter-pill-desktop[data-filter="${filterType}"]`).forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
                    document.querySelectorAll(`.filter-pill[data-filter="${filterType}"]`).forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
                    activeFilters[filterType] = value;
                    pill.classList.add('active');
                    pill.setAttribute('aria-pressed', 'true');
                    // También seleccionar en los filtros móviles
                    document.querySelectorAll(`.filter-pill[data-filter="${filterType}"][data-value="${value}"]`).forEach(p => { p.classList.add('active'); p.setAttribute('aria-pressed', 'true'); });
                }

                updateFilterUI();
                renderQuedadas();
            });
        });
    }

    function clearAdvancedFilters() {
        activeFilters = { nivel: null, horario: null, distancia: null, ritmo: null, verificado: null, premium_org: null };
        document.querySelectorAll('.filter-pill, .filter-pill-desktop').forEach(p => { p.classList.remove('active'); p.setAttribute('aria-pressed', 'false'); });
        updateFilterUI();
        renderQuedadas();
    }

    function clearAllFilters() {
        clearAdvancedFilters();
    }

    function updateSaveAlertButton() {
        const hasFilters = Object.values(activeFilters).some(v => v !== null);
        const btn = document.getElementById('btn-save-alert');
        if (btn) {
            btn.classList.toggle('hidden', !hasFilters);
        }
    }

    function openSaveAlertModal() {
        if (!currentUser) {
            showToast('Inicia sesión para guardar alertas', 'error');
            openModal('modal-login');
            return;
        }

        const summaryEl = document.getElementById('alert-filters-summary');
        if (summaryEl) {
            const filterLabels = {
                horario: { label: 'Horario', values: { manana: 'Mañana', mediodia: 'Mediodía', tarde: 'Tarde', noche: 'Noche' } },
                nivel: { label: 'Nivel', values: {} },
                distancia: { label: 'Distancia', values: { '5': '≤5 km', '10': '≤10 km', '15': '≤15 km', '21': '≤21 km', '42': 'Maratón+' } },
                dia: { label: 'Día', values: { '0': 'Domingo', '1': 'Lunes', '2': 'Martes', '3': 'Miércoles', '4': 'Jueves', '5': 'Viernes', '6': 'Sábado' } }
            };

            let html = '';
            for (const [key, value] of Object.entries(activeFilters)) {
                if (value) {
                    const config = filterLabels[key];
                    const displayValue = config?.values?.[value] || value;
                    html += `<p class="flex items-center gap-2"><span class="text-orange-400">•</span> ${config?.label || key}: <strong>${displayValue}</strong></p>`;
                }
            }
            summaryEl.innerHTML = html || '<p class="text-gray-500">Sin filtros activos</p>';
        }

        const nameInput = document.getElementById('alert-name');
        if (nameInput) {
            nameInput.value = '';
            document.getElementById('alert-name-count').textContent = '0';
        }

        openModal('modal-save-alert');
    }

    async function saveAlert() {
        const name = document.getElementById('alert-name')?.value?.trim();
        if (!name) {
            showToast('Ponle un nombre a la alerta', 'error');
            return;
        }

        const pushEnabled = document.getElementById('alert-push')?.checked;
        const emailEnabled = document.getElementById('alert-email')?.checked;

        if (!pushEnabled && !emailEnabled) {
            showToast('Selecciona al menos un tipo de notificación', 'error');
            return;
        }

        try {
            const sb = window.supabaseClient;
            if (!sb || !currentUser) {
                showToast('Error de conexión', 'error');
                return;
            }

            const { error } = await sb.from('user_alerts').insert([{
                user_id: currentUser.id,
                name: name,
                filters: activeFilters,
                notifications: { push: pushEnabled, email: emailEnabled },
                is_active: true
            }]);

            if (error) throw error;

            closeModal('modal-save-alert');
            showToast('🔔 Alerta guardada. Te notificaremos cuando haya nuevas quedadas', 'success');

        } catch (err) {
            console.error('Error guardando alerta:', err);
            showToast('Error al guardar la alerta', 'error');
        }
    }

    // Actualizar contador de nombre de alerta
    document.addEventListener('DOMContentLoaded', () => {
        const nameInput = document.getElementById('alert-name');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                const count = e.target.value.length;
                const countEl = document.getElementById('alert-name-count');
                if (countEl) countEl.textContent = count;
            });
        }
    });

    function applyAdvancedFilters(quedadasList) {
        return quedadasList.filter(q => {
            if (activeFilters.nivel && q.nivel !== activeFilters.nivel) return false;
            if (activeFilters.horario && q.hora) {
                const hour = parseInt(q.hora.split(':')[0]);
                if (activeFilters.horario === 'manana' && (hour < 6 || hour >= 12)) return false;
                if (activeFilters.horario === 'tarde' && (hour < 12 || hour >= 20)) return false;
                if (activeFilters.horario === 'noche' && (hour < 20 && hour >= 6)) return false;
            }
            if (activeFilters.distancia && q.distancia) {
                const dist = parseFloat(q.distancia.replace(/[^\d.]/g, ''));
                if (activeFilters.distancia === 'corta' && dist >= 8) return false;
                if (activeFilters.distancia === 'media' && (dist < 8 || dist > 15)) return false;
                if (activeFilters.distancia === 'larga' && dist <= 15) return false;
            }
            if (activeFilters.ritmo && q.ritmo) {
                const ritmoStr = q.ritmo.toLowerCase();
                const minMatch = ritmoStr.match(/(\d+):(\d+)/);
                if (minMatch) {
                    const mins = parseInt(minMatch[1]) + parseInt(minMatch[2]) / 60;
                    if (activeFilters.ritmo === 'lento' && mins < 6) return false;
                    if (activeFilters.ritmo === 'moderado' && (mins < 5 || mins >= 6)) return false;
                    if (activeFilters.ritmo === 'rapido' && mins >= 5) return false;
                }
            }
            if (activeFilters.verificado === 'true') {
                if (!q.organizador?.verification_badge) return false;
            }
            if (activeFilters.premium_org === 'true') {
                if (!q.organizador?.es_premium && !q.es_premium) return false;
            }
            return true;
        });
    }

    // ─── Expose to window ────────────────────────────────
    window.activeFilters = activeFilters;
    window.toggleAdvancedFilters = toggleAdvancedFilters;
    window.initFilterPills = initFilterPills;
    window.updateFilterUI = updateFilterUI;
    window.initDesktopFilters = initDesktopFilters;
    window.clearAdvancedFilters = clearAdvancedFilters;
    window.clearAllFilters = clearAllFilters;
    window.updateSaveAlertButton = updateSaveAlertButton;
    window.openSaveAlertModal = openSaveAlertModal;
    window.saveAlert = saveAlert;
    window.applyAdvancedFilters = applyAdvancedFilters;
})();
