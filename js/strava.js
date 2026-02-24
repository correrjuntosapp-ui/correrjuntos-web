// ========================= STRAVA INTEGRATION =========================
(function(){
    // ===== STRAVA CONFIG =====
    const STRAVA_CLIENT_ID = '199454';
    const STRAVA_REDIRECT_URI = 'https://correrjuntos.com/strava/callback';
    const STRAVA_SCOPE = 'read,activity:read_all,activity:write';

    // Variable para almacenar conexión de Strava
    let stravaConnection = null;

    // ===== CONECTAR CON STRAVA =====
    window.connectStrava = function() {
        const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&response_type=code&scope=${STRAVA_SCOPE}`;

        // Guardar estado para verificar después
        localStorage.setItem('strava_auth_state', Date.now().toString());

        // Abrir ventana de autorización
        window.location.href = authUrl;
    };

    // ===== PROCESAR CALLBACK DE STRAVA =====
    window.handleStravaCallback = async function() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            showToast('Error al conectar con Strava: ' + error, 'error');
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }

        if (code) {
            try {
                showToast('Conectando con Strava...', 'info');

                // Intercambiar código por tokens directamente con Strava
                const response = await fetch('https://www.strava.com/oauth/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: STRAVA_CLIENT_ID,
                        client_secret: 'f176cbe4a5c51e9ba48b423406758f31e8451ca2',
                        code: code,
                        grant_type: 'authorization_code'
                    })
                });

                if (!response.ok) {
                    throw new Error('Error al obtener tokens de Strava');
                }

                const data = await response.json();

                // Guardar en Supabase
                await saveStravaConnection(data);

                showToast('¡Conectado con Strava! 🎉', 'success');
                await loadStravaConnection();

            } catch (err) {
                console.error('Error Strava callback:', err);
                showToast('Error al conectar con Strava', 'error');
            }

            // Limpiar URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    };

    // ===== GUARDAR CONEXIÓN EN SUPABASE =====
    async function saveStravaConnection(data) {
        if (!currentUser) return;

        const { error } = await window.supabaseClient
            .from('strava_connections')
            .upsert({
                user_id: currentUser.id,
                strava_athlete_id: data.athlete.id,
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: data.expires_at,
                athlete_data: data.athlete,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

        if (error) {
            console.error('Error guardando conexión Strava:', error);
            throw error;
        }
    }

    // ===== CARGAR CONEXIÓN DE STRAVA =====
    window.loadStravaConnection = async function() {
        if (!currentUser) return;

        try {
            const { data, error } = await window.supabaseClient
                .from('strava_connections')
                .select('*')
                .eq('user_id', currentUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error cargando Strava:', error);
                return;
            }

            stravaConnection = data;
            updateStravaUI();

            if (data) {
                // Verificar si el token ha expirado
                if (data.expires_at * 1000 < Date.now()) {
                    await refreshStravaToken();
                }
                await loadStravaStats();
            }

        } catch (err) {
            console.error('Error en loadStravaConnection:', err);
        }
    };

    // ===== REFRESCAR TOKEN DE STRAVA =====
    async function refreshStravaToken() {
        if (!stravaConnection) return;

        try {
            const response = await fetch('https://www.strava.com/oauth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    client_id: STRAVA_CLIENT_ID,
                    client_secret: 'f176cbe4a5c51e9ba48b423406758f31e8451ca2',
                    refresh_token: stravaConnection.refresh_token,
                    grant_type: 'refresh_token'
                })
            });

            if (response.ok) {
                const data = await response.json();
                await window.supabaseClient
                    .from('strava_connections')
                    .update({
                        access_token: data.access_token,
                        refresh_token: data.refresh_token,
                        expires_at: data.expires_at,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', currentUser.id);

                stravaConnection.access_token = data.access_token;
                stravaConnection.refresh_token = data.refresh_token;
                stravaConnection.expires_at = data.expires_at;
            }
        } catch (err) {
            console.error('Error refrescando token Strava:', err);
        }
    }

    // ===== CARGAR ESTADÍSTICAS DE STRAVA =====
    window.loadStravaStats = async function() {
        if (!stravaConnection) return;

        try {
            // Obtener stats del atleta
            const statsResponse = await fetch(`https://www.strava.com/api/v3/athletes/${stravaConnection.strava_athlete_id}/stats`, {
                headers: { 'Authorization': `Bearer ${stravaConnection.access_token}` }
            });

            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                updateStravaStatsUI(stats);
            }

            // Obtener actividades recientes (últimos 30 días)
            const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
            const activitiesResponse = await fetch(`https://www.strava.com/api/v3/athlete/activities?after=${thirtyDaysAgo}&per_page=100`, {
                headers: { 'Authorization': `Bearer ${stravaConnection.access_token}` }
            });

            if (activitiesResponse.ok) {
                const activities = await activitiesResponse.json();
                const runActivities = activities.filter(a => a.type === 'Run');
                document.getElementById('strava-recent-runs').textContent = runActivities.length;
            }

        } catch (err) {
            console.error('Error cargando stats Strava:', err);
        }
    };

    // ===== ACTUALIZAR UI CON STATS DE STRAVA =====
    function updateStravaStatsUI(stats) {
        const allRuns = stats.all_run_totals || {};

        // Total de carreras
        document.getElementById('strava-total-runs').textContent = allRuns.count || 0;

        // Distancia total (metros a km)
        const totalKm = ((allRuns.distance || 0) / 1000).toFixed(0);
        document.getElementById('strava-total-distance').textContent = totalKm;

        // Tiempo total (segundos a horas)
        const totalHours = ((allRuns.moving_time || 0) / 3600).toFixed(0);
        document.getElementById('strava-total-time').textContent = totalHours;

        // Ritmo medio (min/km)
        if (allRuns.distance > 0 && allRuns.moving_time > 0) {
            const avgPaceSeconds = (allRuns.moving_time / (allRuns.distance / 1000));
            const minutes = Math.floor(avgPaceSeconds / 60);
            const seconds = Math.floor(avgPaceSeconds % 60);
            document.getElementById('strava-avg-pace').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // ===== ACTUALIZAR UI DE STRAVA =====
    function updateStravaUI() {
        const locked = document.getElementById('strava-locked');
        const notConnected = document.getElementById('strava-not-connected');
        const connected = document.getElementById('strava-connected');
        const badge = document.getElementById('strava-status-badge');
        const premiumBadge = document.getElementById('strava-premium-badge');

        // Verificar si el usuario es Premium (la variable global isUserPremium se define en el scope principal)
        const isPremium = (typeof isUserPremium !== 'undefined' && isUserPremium) ||
                          (typeof window.isUserPremium !== 'undefined' && window.isUserPremium) ||
                          (window.currentUser && window.currentUser.es_premium);
        console.log('Strava UI - isPremium:', isPremium, 'isUserPremium:', typeof isUserPremium !== 'undefined' ? isUserPremium : 'undefined');

        if (!isPremium) {
            // Usuario NO es Premium: mostrar bloqueo
            locked?.classList.remove('hidden');
            notConnected?.classList.add('hidden');
            connected?.classList.add('hidden');
            badge?.classList.add('hidden');
            premiumBadge?.classList.remove('hidden');
            return;
        }

        // Usuario ES Premium: ocultar bloqueo y badge PRO
        locked?.classList.add('hidden');
        premiumBadge?.classList.add('hidden');

        if (stravaConnection && stravaConnection.athlete_data) {
            const athlete = stravaConnection.athlete_data;

            notConnected?.classList.add('hidden');
            connected?.classList.remove('hidden');
            badge?.classList.remove('hidden');

            // Llenar datos del atleta
            const photo = document.getElementById('strava-athlete-photo');
            const name = document.getElementById('strava-athlete-name');
            const location = document.getElementById('strava-athlete-location');
            const link = document.getElementById('strava-profile-link');

            if (photo) { photo.src = athlete.profile_medium || athlete.profile || ''; photo.alt = (athlete.firstname || 'Atleta') + ' — Strava'; }
            if (name) name.textContent = `${athlete.firstname} ${athlete.lastname}`;
            if (location) location.textContent = `${athlete.city || ''}, ${athlete.country || ''}`.replace(/^, |, $/g, '');
            if (link) link.href = `https://www.strava.com/athletes/${athlete.id}`;

        } else {
            notConnected?.classList.remove('hidden');
            connected?.classList.add('hidden');
            badge?.classList.add('hidden');
        }
    }

    // ===== REFRESCAR STATS MANUALMENTE =====
    window.refreshStravaStats = async function() {
        showToast('Actualizando estadísticas...', 'info');
        await loadStravaStats();
        showToast('Estadísticas actualizadas', 'success');
    };

    // ===== DESCONECTAR STRAVA =====
    window.disconnectStrava = async function() {
        if (!currentUser) return;

        if (!confirm('¿Seguro que quieres desconectar tu cuenta de Strava?')) return;

        try {
            const { error } = await window.supabaseClient
                .from('strava_connections')
                .delete()
                .eq('user_id', currentUser.id);

            if (error) throw error;

            stravaConnection = null;
            updateStravaUI();
            showToast('Strava desconectado', 'success');

        } catch (err) {
            console.error('Error desconectando Strava:', err);
            showToast('Error al desconectar', 'error');
        }
    };

    // ===== EXPORTAR QUEDADA A STRAVA =====
    window.exportToStrava = async function(quedadaId, quedadaData) {
        if (!stravaConnection) {
            showToast('Conecta tu cuenta de Strava primero', 'warning');
            return;
        }

        try {
            const activity = {
                name: `${quedadaData.titulo} - CorrerJuntos`,
                type: 'Run',
                start_date_local: quedadaData.fecha + 'T' + quedadaData.hora + ':00',
                elapsed_time: quedadaData.duracion_minutos ? quedadaData.duracion_minutos * 60 : 3600,
                description: `Quedada de running con CorrerJuntos 🏃\n${quedadaData.descripcion || ''}\nNivel: ${quedadaData.nivel}\nRitmo: ${quedadaData.ritmo}`,
                distance: quedadaData.distancia_km ? quedadaData.distancia_km * 1000 : 5000,
                trainer: false,
                commute: false
            };

            const response = await fetch('https://www.strava.com/api/v3/activities', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${stravaConnection.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(activity)
            });

            if (response.ok) {
                showToast('¡Actividad exportada a Strava! 🎉', 'success');
                return true;
            } else {
                throw new Error('Error al exportar');
            }

        } catch (err) {
            console.error('Error exportando a Strava:', err);
            showToast('Error al exportar a Strava', 'error');
            return false;
        }
    };

})();
