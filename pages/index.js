import dynamic from "next/dynamic";

// Loaded client-side only — the app talks to /api routes and uses browser APIs (print, etc.)
const QAAuditApp = dynamic(() => import("../components/QAAuditApp"), { ssr: false });

export default function Home() {
  return <QAAuditApp />;
}
