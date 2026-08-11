import { useState } from "react";
import { api } from "./apiClient";
import Field from "./Field";
import { styles } from "./styles";

export default function ChangePasswordView({ showToast }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) {
      showToast("New passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await api("auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      showToast("Password changed. Everyone will need to log in again with the new one.");
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (e) {
      showToast(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 style={styles.h1}>Change Password</h1>
      <p style={styles.subtle}>This changes the shared password everyone on the team uses to get in.</p>
      <form onSubmit={submit} style={{ ...styles.editorPanel, maxWidth: 360 }}>
        <Field label="Current password">
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <div style={{ height: 12 }} />
        <Field label="New password">
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        </Field>
        <div style={{ height: 12 }} />
        <Field label="Confirm new password">
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>
        <button type="submit" className="primaryBtn" disabled={busy} style={{ marginTop: 16 }}>
          {busy ? "Saving…" : "Change password"}
        </button>
      </form>
    </div>
  );
}
