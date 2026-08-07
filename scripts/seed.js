// Run once after creating the database schema: `npm run seed`
// Populates the starter domains (Core, Web & Cloud, IoT, Automotive) and
// their checklist items. Safe to re-run — it skips if data already exists.
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const { SEED_DOMAINS, SEED_ITEMS } = require("../lib/seedData");

async function main() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill it in.");
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const { count } = await supabase.from("domains").select("*", { count: "exact", head: true });
  if (count && count > 0) {
    console.log(`domains table already has ${count} row(s) — skipping seed. Delete rows first if you want to reseed.`);
    return;
  }

  const { error: dErr } = await supabase.from("domains").insert(SEED_DOMAINS);
  if (dErr) throw dErr;

  const itemRows = SEED_ITEMS.map((it) => ({
    id: it.id, domain_id: it.domainId, category: it.category, question: it.question, weight: it.weight, type: it.type,
  }));
  const { error: iErr } = await supabase.from("checklist_items").insert(itemRows);
  if (iErr) throw iErr;

  console.log(`Seeded ${SEED_DOMAINS.length} domains and ${itemRows.length} checklist items.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
