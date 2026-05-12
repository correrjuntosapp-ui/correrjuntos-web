import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import webpush from "https://esm.sh/web-push@3.6.7";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

function norm(s: string) {
  return (s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return json({ ok: true }, 200);
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
    const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
    const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
    const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

    // Validar token de usuario (evita abuso)
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return json({ error: "Missing Authorization Bearer token" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) return json({ error: "Invalid user token" }, 401);

    const body = await req.json().catch(() => ({}));
    const quedada_id = body?.quedada_id;
    if (!quedada_id) return json({ error: "Missing quedada_id" }, 400);

    // Leer quedada
    const { data: q, error: qErr } = await admin
      .from("quedadas")
      .select("id, ciudad, titulo, fecha, hora")
      .eq("id", quedada_id)
      .single();

    if (qErr || !q) return json({ error: "Quedada not found", details: qErr?.message }, 404);

    const city_norm = norm(q.ciudad || "");
    if (!city_norm) return json({ error: "Quedada city is empty" }, 400);

    // Suscripciones por ciudad
    const { data: subs, error: sErr } = await admin
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("enabled", true)
      .eq("city_norm", city_norm);

    if (sErr) return json({ error: "Subscriptions query failed", details: sErr.message }, 500);

    const list = subs || [];
    if (list.length === 0) return json({ ok: true, city_norm, sent: 0, note: "No subscribers" }, 200);

    // VAPID
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const payload = JSON.stringify({
      title: "Nueva quedada en tu ciudad",
      body: `${q.titulo || "Nueva quedada"} · ${q.ciudad} · ${q.fecha || ""} ${q.hora || ""}`.trim(),
      url: "/",
    });

    let sent = 0;
    let failed = 0;

    for (const row of list) {
      try {
        await webpush.sendNotification(row.subscription as any, payload);
        sent++;
      } catch (_e) {
        failed++;
      }
    }

    return json({ ok: true, city_norm, total: list.length, sent, failed }, 200);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
