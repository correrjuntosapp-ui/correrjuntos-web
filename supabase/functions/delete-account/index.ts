import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Leer token del usuario
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response("No auth header", { status: 401 });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) return new Response("Usuario no válido", { status: 401 });

    const userId = user.id;

    // Borrar participaciones
    await supabaseAdmin.from("participantes").delete().eq("user_id", userId);

    // Borrar quedadas creadas por el usuario
    await supabaseAdmin.from("quedadas").delete().eq("creador_id", userId);

    // Borrar perfil
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // Borrar usuario de Auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) return new Response(deleteError.message, { status: 500 });

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
