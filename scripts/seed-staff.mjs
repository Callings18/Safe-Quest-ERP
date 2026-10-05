import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.VITE_SUPABASE_URL;
const anon = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const service = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = "safequest@.24";

const staff = [
  { email: "safequest2022@gmail.com", name: "Chief Executive Officer", role: "admin" },
  { email: "safequest2022+manager@gmail.com", name: "Operations Manager", role: "manager" },
  { email: "safequest2022+accountant@gmail.com", name: "Accountant", role: "accountant" },
  { email: "safequest2022+reception@gmail.com", name: "Receptionist", role: "receptionist" },
  { email: "safequest2022+field@gmail.com", name: "Field Technician", role: "technician" },
  { email: "safequest2022+loans@gmail.com", name: "Loan Officer", role: "loan_officer" },
];

async function adminCreate(user) {
  const res = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: service,
      Authorization: `Bearer ${service}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: user.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: user.name },
    }),
  });
  const json = await res.json();
  if (res.status === 200 || res.status === 201) return { ok: true, id: json.id, created: true };
  // User may already exist — try update password by listing
  if (String(json.msg || json.message || "").toLowerCase().includes("already")) {
    return { ok: true, created: false, exists: true };
  }
  return { ok: false, error: json.msg || json.message || json.error_description || JSON.stringify(json) };
}

async function signupFallback(user) {
  const res = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: user.email, password, data: { full_name: user.name } }),
  });
  const json = await res.json();
  return { status: res.status, confirmed: !!json.user?.email_confirmed_at, session: !!json.access_token };
}

async function signin(email) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  return { ok: res.status === 200 && !!json.access_token, msg: json.msg || json.error_description || null };
}

console.log(service ? "Using service role admin API" : "No service role — signup only (needs SQL confirm)");

for (const user of staff) {
  if (service) {
    const r = await adminCreate(user);
    console.log(`${user.email} admin=${JSON.stringify(r)}`);
  } else {
    const r = await signupFallback(user);
    console.log(`${user.email} signup=${JSON.stringify(r)}`);
  }
}

if (service) {
  // Assign roles via SQL-less REST where possible
  for (const user of staff) {
    const list = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, {
      headers: { apikey: service, Authorization: `Bearer ${service}` },
    });
    const body = await list.json();
    const found = (body.users || []).find((u) => (u.email || "").toLowerCase() === user.email.toLowerCase());
    if (!found) {
      console.log(`ROLE_SKIP missing ${user.email}`);
      continue;
    }
    const ins = await fetch(`${url}/rest/v1/user_roles`, {
      method: "POST",
      headers: {
        apikey: service,
        Authorization: `Bearer ${service}`,
        "Content-Type": "application/json",
        Prefer: "resolution=ignore-duplicates",
      },
      body: JSON.stringify({ user_id: found.id, role: user.role }),
    });
    console.log(`ROLE ${user.email} -> ${user.role} status=${ins.status}`);
  }
}

console.log("\nSign-in checks:");
for (const user of staff) {
  const r = await signin(user.email);
  console.log(`${user.email} signin_ok=${r.ok}${r.msg ? " msg=" + r.msg : ""}`);
}
