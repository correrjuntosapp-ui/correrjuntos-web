// ============================================================================
// F108.1 · Adaptador de CONTACTABILIDAD Brevo — ESTRICTAMENTE READ-ONLY
//
// Existe para que el dry-run pueda medir usuarios REALMENTE contactables sin
// enviar nada. Reglas estructurales, no de estilo:
//
//   · No expone ni contiene ninguna función de envío.
//   · No importa el helper de envío (este módulo no importa NADA del proyecto).
//   · El método HTTP está fijado a 'GET' y se verifica en tiempo de ejecución:
//     cualquier intento de usar otro verbo lanza antes de tocar la red.
//   · La ruta se valida contra una allowlist: solo /v3/contacts/{email}.
//   · 401, 403, 429, 5xx, timeout y respuesta malformada → FAIL CLOSED.
//   · Nunca imprime la clave, el email, el user_id ni el cuerpo de Brevo.
//   · No persiste el email en ningún sitio.
// ============================================================================

const HOST = 'api.brevo.com';
const ALLOWED_METHOD = 'GET';
const ALLOWED_PATH = /^\/v3\/contacts\/[^/]+$/;

// Motivos cerrados que devuelve el adaptador (sin PII por construcción).
export const CONTACT_STATUS = {
  OK: 'ok',
  BLACKLISTED: 'brevo_blocked',
  HARD_BOUNCE: 'hard_bounce',
  COMPLAINT: 'complaint',
  UNSUBSCRIBED: 'unsubscribed',
  ERROR: 'brevo_lookup_failed',
};

/**
 * @param {object} o
 * @param {string} o.apiKey       BREVO_API_KEY (Sensitive de Vercel). Nunca se imprime.
 * @param {function} [o.httpGet]  Inyectable para pruebas: (host, path, headers, timeoutMs) → {status, json}
 * @param {number} [o.timeoutMs]
 */
export function createBrevoContactability({ apiKey, httpGet, timeoutMs = 8000 } = {}) {
  const get = httpGet || defaultHttpGet;

  async function request(method, path) {
    // Cinturón 1: verbo fijado. Cambiar esto rompe aquí, no en producción.
    if (method !== ALLOWED_METHOD) {
      throw new Error('brevo-contactability: solo se permite GET');
    }
    // Cinturón 2: allowlist de rutas. Impide alcanzar la ruta transaccional
    // de envío de Brevo (deliberadamente no se nombra aquí: el harness veta
    // que este fichero contenga siquiera esa cadena).
    if (!ALLOWED_PATH.test(path)) {
      throw new Error('brevo-contactability: ruta no permitida');
    }
    return get(HOST, path, { 'api-key': apiKey, accept: 'application/json' }, timeoutMs);
  }

  /**
   * Consulta el estado de contacto. Devuelve SIEMPRE un motivo de lista cerrada.
   * @param {string} email  Solo en memoria; jamás se registra ni se persiste.
   */
  async function check(email) {
    if (!apiKey) return CONTACT_STATUS.ERROR;                 // sin credencial: fail closed
    if (typeof email !== 'string' || email.indexOf('@') < 1) return CONTACT_STATUS.ERROR;

    let r;
    try {
      r = await request(ALLOWED_METHOD, '/v3/contacts/' + encodeURIComponent(email.trim().toLowerCase()));
    } catch {
      return CONTACT_STATUS.ERROR;                            // timeout / red / verbo o ruta inválidos
    }
    if (!r || typeof r.status !== 'number') return CONTACT_STATUS.ERROR;

    // 404 = no es contacto de Brevo: no hay supresión registrada contra él.
    if (r.status === 404) return CONTACT_STATUS.OK;

    // Todo lo demás que no sea 200 es fail closed (incluye 401/403/429/5xx).
    if (r.status !== 200) return CONTACT_STATUS.ERROR;

    const c = r.json;
    if (!c || typeof c !== 'object') return CONTACT_STATUS.ERROR;   // malformada → fail closed

    // Orden de severidad: queja > rebote duro > baja > bloqueo genérico.
    const attrs = (c.attributes && typeof c.attributes === 'object') ? c.attributes : {};
    if (attrs.COMPLAINT === true || c.emailComplained === true) return CONTACT_STATUS.COMPLAINT;
    if (attrs.HARD_BOUNCE === true || c.emailHardBounced === true) return CONTACT_STATUS.HARD_BOUNCE;
    if (c.emailBlacklisted === true) {
      // Brevo marca emailBlacklisted tanto al darse de baja como al suprimir.
      return c.unsubscribed === true ? CONTACT_STATUS.UNSUBSCRIBED : CONTACT_STATUS.BLACKLISTED;
    }
    if (c.smsBlacklisted === true && c.emailBlacklisted === true) return CONTACT_STATUS.BLACKLISTED;
    return CONTACT_STATUS.OK;
  }

  return { check, CONTACT_STATUS };
}

// GET real. Aislado para que las pruebas nunca toquen la red.
function defaultHttpGet(host, path, headers, timeoutMs) {
  return new Promise((resolve) => {
    import('node:https').then(({ default: https }) => {
      const req = https.request({ host, path, method: ALLOWED_METHOD, headers }, (res) => {
        let d = '';
        res.on('data', (c) => { d += c; if (d.length > 100000) req.destroy(); });
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(d); } catch { json = null; }
          resolve({ status: res.statusCode, json });
        });
      });
      req.on('error', () => resolve(null));
      req.setTimeout(timeoutMs, () => { req.destroy(); resolve(null); });
      req.end();
    }).catch(() => resolve(null));
  });
}
