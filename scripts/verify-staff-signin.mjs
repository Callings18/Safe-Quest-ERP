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
const password = "safequest@.24";
const emails = [
  "safequest2022@gmail.com",
  "safequest2022+manager@gmail.com",
  "safequest2022+accountant@gmail.com",
  "safequest2022+reception@gmail.com",
  "safequest2022+field@gmail.com",
  "safequest2022+loans@gmail.com",
];

for (const email of emails) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  const ok = res.status === 200 && !!json.access_token;
  console.log(`${ok ? "OK" : "FAIL"} ${email}${ok ? "" : " " + (json.msg || json.error_description || res.status)}`);
}
