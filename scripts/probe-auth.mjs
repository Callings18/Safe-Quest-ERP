import fs from "fs";

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const email = "safequest2022+probe@gmail.com";
const password = "safequest@.24";

async function call(path, body) {
  const res = await fetch(url + path, {
    method: "POST",
    headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 300) };
  }
  return { status: res.status, json };
}

const signup = await call("/auth/v1/signup", { email, password, data: { full_name: "Probe" } });
console.log(
  JSON.stringify(
    {
      status: signup.status,
      has_session: !!signup.json.access_token,
      confirmed: !!signup.json.user?.email_confirmed_at,
      identities: signup.json.user?.identities?.length,
      msg: signup.json.msg || signup.json.error_description || signup.json.message || null,
    },
    null,
    2,
  ),
);

const signin = await call("/auth/v1/token?grant_type=password", { email, password });
console.log(
  JSON.stringify(
    {
      signin: signin.status,
      ok: !!signin.json.access_token,
      msg: signin.json.msg || signin.json.error_description || null,
    },
    null,
    2,
  ),
);
