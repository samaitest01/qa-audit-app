import { styles } from "./styles";

export default function Field({ label, children, error }) {
  return (
    <label style={styles.field}>
      <span style={{ ...styles.fieldLabel, color: error ? "#e08480" : undefined }}>{label}</span>
      {children}
    </label>
  );
}
