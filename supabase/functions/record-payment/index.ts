import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, json } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json({ error: "Missing authorization" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return json({ error: "Unauthorized" }, 401);

  const body = await req.json().catch(() => ({}));
  const { invoice_id, amount, payment_method, reference, notes, payment_date } = body;
  if (!invoice_id || !amount || !payment_method) {
    return json({ error: "invoice_id, amount, and payment_method are required" }, 400);
  }

  const { data, error } = await supabase.rpc("record_invoice_payment", {
    p_invoice_id: invoice_id,
    p_amount: amount,
    p_payment_method: payment_method,
    p_reference: reference ?? null,
    p_notes: notes ?? null,
    p_payment_date: payment_date ?? new Date().toISOString().slice(0, 10),
  });

  if (error) return json({ error: error.message }, 400);
  return json({ ok: true, result: data });
});
