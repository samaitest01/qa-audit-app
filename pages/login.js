import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Login failed");
      router.push("/");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <form onSubmit={submit} style={styles.card}>
        <div style={styles.mark}>QA</div>
        <h1 style={styles.title}>Audit Console</h1>
        <p style={styles.subtitle}>Enter the team password to continue.</p>
        <input
          type="password"
          autoFocus
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e1319", fontFamily: "system-ui, sans-serif" },
  card: { width: 320, background: "#171f28", border: "1px solid #232d38", borderRadius: 14, padding: 28, textAlign: "center" },
  mark: { width: 40, height: 40, margin: "0 auto 14px", borderRadius: 9, background: "linear-gradient(135deg,#e8a33d,#c97a2e)", color: "#12181f", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "monospace" },
  title: { color: "#eef1f4", fontSize: 18, fontWeight: 600, margin: "0 0 4px" },
  subtitle: { color: "#8b96a3", fontSize: 13, margin: "0 0 18px" },
  input: { width: "100%", boxSizing: "border-box", background: "#0e1319", border: "1px solid #232d38", borderRadius: 8, padding: "10px 12px", color: "#eef1f4", fontSize: 14, outline: "none", marginBottom: 10 },
  error: { color: "#e08480", fontSize: 12.5, marginBottom: 10 },
  button: { width: "100%", background: "linear-gradient(135deg,#e8a33d,#c97a2e)", color: "#12181f", border: "none", borderRadius: 8, padding: "10px 12px", fontWeight: 600, fontSize: 14, cursor: "pointer" },
};
