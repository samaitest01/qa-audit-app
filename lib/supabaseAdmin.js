// Server-only Supabase client. Uses the service role key, so this file must
// NEVER be imported from client-side code — only from pages/api/*.
const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local before running the app. " +
    "See .env.example for the required values."
  );
}

const supabaseAdmin = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

module.exports = { supabaseAdmin };
