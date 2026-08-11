const crypto = require("crypto");
const { supabaseAdmin } = require("./supabaseAdmin");

const SETTINGS_KEY = "site_password_hash";

async function getPasswordHash() {
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("value")
    .eq("key", SETTINGS_KEY)
    .maybeSingle();
  if (error) throw error;
  return data ? data.value : null;
}

async function setPasswordHash(hash) {
  const { error } = await supabaseAdmin
    .from("app_settings")
    .upsert({ key: SETTINGS_KEY, value: hash, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// Stores as "salt:hash" (both hex) so verifyPassword can re-derive the hash
// with the same salt and compare in constant time.
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(":");
    const hashBuffer = Buffer.from(hash, "hex");
    const suppliedBuffer = crypto.scryptSync(password, salt, 64);
    if (hashBuffer.length !== suppliedBuffer.length) return false;
    return crypto.timingSafeEqual(hashBuffer, suppliedBuffer);
  } catch (e) {
    return false;
  }
}

module.exports = { getPasswordHash, setPasswordHash, hashPassword, verifyPassword };
