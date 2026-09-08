import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders, json } from "../_shared/cors.ts";

function paye(gross: number, rates: Array<{ rate_type: string; min_amount: number | null; max_amount: number | null; rate: number }>) {
  const bands = rates
    .filter((r) => r.rate_type === "PAYE")
    .sort((a, b) => Number(a.min_amount) - Number(b.min_amount));
  let tax = 0;
  let remaining = gross;
  for (const band of bands) {
    const min = Number(band.min_amount) || 0;
    const max = band.max_amount != null ? Number(band.max_amount) : Infinity;
    if (remaining <= 0) break;
    const width = max - min;
    const inBand = Math.min(remaining, width);
    if (gross > min) {
      tax += inBand * Number(band.rate);
      remaining -= inBand;
    }
  }
  return Math.round(tax * 100) / 100;
}

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
  const pay_period = body.pay_period as string;
  const pay_date = body.pay_date as string;
  if (!pay_period || !pay_date) return json({ error: "pay_period and pay_date required" }, 400);

  const { data: employees, error: empErr } = await supabase.from("employees").select("*").eq("is_active", true);
  if (empErr) return json({ error: empErr.message }, 400);
  if (!employees?.length) return json({ error: "No active employees" }, 400);

  const { data: rates, error: rateErr } = await supabase.from("payroll_rates").select("*").eq("is_active", true);
  if (rateErr) return json({ error: rateErr.message }, 400);

  const napsaEmp = rates?.find((r) => r.rate_type === "NAPSA_EMPLOYEE");
  const napsaEr = rates?.find((r) => r.rate_type === "NAPSA_EMPLOYER");
  const nhima = rates?.find((r) => r.rate_type === "NHIMA_EMPLOYEE");

  let totalGross = 0, totalPaye = 0, totalNapsaE = 0, totalNapsaR = 0, totalNhima = 0, totalNet = 0;
  const slips: Array<Record<string, unknown>> = [];

  for (const emp of employees) {
    const gross = Number(emp.basic_salary) || 0;
    const ceiling = napsaEmp?.max_amount ? Number(napsaEmp.max_amount) : 34900;
    const napsaE = Math.round(Math.min(gross, ceiling) * (napsaEmp ? Number(napsaEmp.rate) : 0.05) * 100) / 100;
    const napsaR = Math.round(Math.min(gross, ceiling) * (napsaEr ? Number(napsaEr.rate) : 0.05) * 100) / 100;
    const nh = Math.round(gross * (nhima ? Number(nhima.rate) : 0.01) * 100) / 100;
    const tax = paye(gross, rates || []);
    const net = Math.round((gross - tax - napsaE - nh) * 100) / 100;
    totalGross += gross;
    totalPaye += tax;
    totalNapsaE += napsaE;
    totalNapsaR += napsaR;
    totalNhima += nh;
    totalNet += net;
    slips.push({
      employee_id: emp.id,
      basic_salary: gross,
      allowances: 0,
      overtime: 0,
      gross_pay: gross,
      paye: tax,
      napsa_employee: napsaE,
      napsa_employer: napsaR,
      nhima: nh,
      other_deductions: 0,
      net_pay: net,
    });
  }

  const { data: run, error: runErr } = await supabase
    .from("payroll_runs")
    .insert({
      pay_period,
      pay_date,
      status: "processed",
      total_gross: totalGross,
      total_paye: totalPaye,
      total_napsa_employee: totalNapsaE,
      total_napsa_employer: totalNapsaR,
      total_nhima: totalNhima,
      total_net: totalNet,
      created_by: user.id,
    })
    .select()
    .single();
  if (runErr) return json({ error: runErr.message }, 400);

  const { error: slipErr } = await supabase.from("payslips").insert(slips.map((s) => ({ ...s, payroll_run_id: run.id })));
  if (slipErr) return json({ error: slipErr.message }, 400);

  await supabase.from("activity_log").insert({
    user_id: user.id,
    action: "payroll_processed",
    entity_type: "payroll",
    entity_id: run.id,
    description: `Payroll ${pay_period} for ${employees.length} employees`,
  });

  return json({ run, count: employees.length });
});
