import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [mode, setMode] = useState("loading"); // 'loading' | 'setup' | 'login'
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => setMode(d.configured ? "login" : "setup"))
      .catch(() => setMode("login"));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "setup" && password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const apiPath = mode === "setup" ? "/api/auth/setup" : "/api/auth/login";
      const endpoint = `${window.location.origin}${apiPath}`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong.");
      router.push("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "loading") {
    return (
      <div style={styles.wrap}>
        <div style={{ color: "#8b96a3", fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  return (
    <div style={styles.wrap}>
      <form onSubmit={submit} style={styles.card}>
        <div style={styles.mark}>QA</div>
        <h1 style={styles.title}>Audit Console</h1>
        <p style={styles.subtitle}>
          {mode === "setup"
            ? "First time here — set a password your whole QA team will use to get in."
            : "Enter the team password to continue."}
        </p>
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        {mode === "setup" && (
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            style={styles.input}
          />
        )}
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Please wait…" : mode === "setup" ? "Set password & enter" : "Enter"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e1319", fontFamily: "system-ui, sans-serif" },
  card: { width: 340, background: "#171f28", border: "1px solid #232d38", borderRadius: 14, padding: 28, textAlign: "center" },
  mark: { width: 40, height: 40, margin: "0 auto 14px", borderRadius: 9, background: "linear-gradient(135deg,#e8a33d,#c97a2e)", color: "#12181f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "monospace" },
  title: { color: "#eef1f4", fontSize: 18, fontWeight: 600, margin: "0 0 4px" },
  subtitle: { color: "#8b96a3", fontSize: 13, margin: "0 0 18px", lineHeight: 1.4 },
  input: { width: "100%", boxSizing: "border-box", background: "#0e1319", border: "1px solid #232d38", borderRadius: 8, padding: "10px 12px", color: "#eef1f4", fontSize: 14, outline: "none", marginBottom: 10 },
  error: { color: "#e08480", fontSize: 12.5, marginBottom: 10 },
  button: { width: "100%", background: "linear-gradient(135deg,#e8a33d,#c97a2e)", color: "#12181f", border: "none", borderRadius: 8, padding: "10px 12px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
};
