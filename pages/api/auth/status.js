const { getPasswordHash } = require("../../../lib/authSettings");

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  try {
    const hash = await getPasswordHash();
    res.status(200).json({ configured: !!hash });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
