// Server-only Supabase client. Uses the service role key, so this file must
// NEVER be imported from client-side code — only from pages/api/*.
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.warn(
    "[supabaseAdmin] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. " +
    "Set them in .env.local (see .env.example)."
  );
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

module.exports = { supabaseAdmin };
