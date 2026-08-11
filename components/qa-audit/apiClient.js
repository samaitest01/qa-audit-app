// Thin wrapper around fetch for talking to our /api routes. Throws an Error
// with a readable message on any non-2xx response so callers can just
// try/catch instead of checking res.ok everywhere.
export async function api(path, options) {
  const res = await fetch(`/api/${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });

  if (!res.ok) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `Request to /api/${path} failed (${res.status})`);
    }
    throw new Error(`Request to /api/${path} failed (${res.status}): ${await res.text()}`);
  }

  if (res.status === 204) return null;
  return res.json();
}
