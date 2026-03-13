// ========================= BADGES CONFIG (static) =========================
(function() {
    var BADGES_CONFIG = [
        // BADGES BASICOS (faciles de conseguir para nuevos usuarios)
        { id: 'first_run', name: 'Primera Carrera', desc: 'Únete a tu primera quedada', icon: '\uD83C\uDFC3', condition: function(s) { return s.quedadas >= 1; }, premium: false },
        { id: 'first_5k', name: 'First 5K', desc: 'Completa una quedada de 5+ km', icon: '\uD83C\uDFAF', condition: function(s) { return s.first5k === true; }, premium: false },
        { id: 'streak_2', name: 'En Racha', desc: '2 semanas seguidas corriendo', icon: '\u26A1', condition: function(s) { return s.racha >= 2; }, premium: false },
        { id: 'run_3', name: 'Triplete', desc: 'Asiste a 3 quedadas', icon: '\uD83E\uDD49', condition: function(s) { return s.quedadas >= 3; }, premium: false },
        { id: 'social_3', name: 'Conociendo Gente', desc: 'Corre con 3 runners diferentes', icon: '\uD83E\uDD1D', condition: function(s) { return s.runners >= 3; }, premium: false },
        // BADGES INTERMEDIOS
        { id: 'run_5', name: 'Habitual', desc: 'Asiste a 5 quedadas', icon: '\uD83E\uDD48', condition: function(s) { return s.quedadas >= 5; }, premium: false },
        { id: 'social_5', name: 'Social Runner', desc: 'Conoce a 5 runners diferentes', icon: '\uD83D\uDC65', condition: function(s) { return s.runners >= 5; }, premium: false },
        { id: 'creator', name: 'Líder', desc: 'Crea tu primera quedada', icon: '\uD83D\uDC51', condition: function(s) { return s.created >= 1; }, premium: false },
        { id: 'km_25', name: 'Maratonista', desc: 'Acumula 25 km en quedadas', icon: '\uD83C\uDFC1', condition: function(s) { return s.km >= 25; }, premium: false },
        { id: 'streak_4', name: 'Constancia', desc: 'Racha de 4 semanas corriendo', icon: '\uD83D\uDD25', condition: function(s) { return s.racha >= 4; }, premium: false },
        // BADGES AVANZADOS
        { id: 'run_10', name: 'Veterano', desc: 'Asiste a 10 quedadas', icon: '\uD83C\uDF96\uFE0F', condition: function(s) { return s.quedadas >= 10; }, premium: false },
        { id: 'km_50', name: '50K Club', desc: 'Acumula 50 km en quedadas', icon: '\uD83D\uDCCF', condition: function(s) { return s.km >= 50; }, premium: false },
        { id: 'km_100', name: 'Centenario', desc: 'Acumula 100 km en quedadas', icon: '\uD83D\uDCAF', condition: function(s) { return s.km >= 100; }, premium: false },
        { id: 'run_25', name: 'Leyenda', desc: 'Asiste a 25 quedadas', icon: '\uD83C\uDFC6', condition: function(s) { return s.quedadas >= 25; }, premium: false },
        // BADGES EXCLUSIVOS PREMIUM
        { id: 'premium_vip', name: 'VIP Runner', desc: 'Eres miembro Premium', icon: '\u2B50', condition: function() { return window.isUserPremium; }, premium: true, exclusive: true },
        { id: 'premium_elite', name: 'Elite Dorado', desc: 'Premium + 50 quedadas', icon: '\uD83E\uDD47', condition: function(s) { return window.isUserPremium && s.quedadas >= 50; }, premium: true, exclusive: true },
        { id: 'premium_champion', name: 'Campeón Premium', desc: 'Premium + 200 km', icon: '\uD83C\uDFC5', condition: function(s) { return window.isUserPremium && s.km >= 200; }, premium: true, exclusive: true },
        { id: 'premium_influencer', name: 'Influencer', desc: 'Premium + 10 quedadas creadas', icon: '\uD83D\uDCE3', condition: function(s) { return window.isUserPremium && s.created >= 10; }, premium: true, exclusive: true },
        { id: 'premium_legend', name: 'Leyenda Dorada', desc: 'Premium + 100 quedadas', icon: '\uD83D\uDC51', condition: function(s) { return window.isUserPremium && s.quedadas >= 100; }, premium: true, exclusive: true },
        // BADGES DE REFERIDOS
        { id: 'referral_community_builder', name: 'Community Builder', desc: 'Invita a 3 amigos a CorrerJuntos', icon: '\uD83E\uDD1D', condition: function() { return (window.currentUser && window.currentUser.referral_count || 0) >= 3; }, premium: false },
        { id: 'referral_premium_reward', name: 'Super Recruiter', desc: 'Invita a 5 amigos y gana 1 mes Premium', icon: '\u2B50', condition: function() { return (window.currentUser && window.currentUser.referral_count || 0) >= 5; }, premium: false },
        { id: 'referral_ambassador', name: 'Ambassador', desc: 'Invita a 10 amigos y conviértete en embajador', icon: '\uD83C\uDFC6', condition: function() { return (window.currentUser && window.currentUser.referral_count || 0) >= 10; }, premium: false },
    ];

    window.BADGES_CONFIG = BADGES_CONFIG;
})();
