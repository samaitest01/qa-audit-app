// Plain inline-style objects and one global <style> block — this project
// doesn't use CSS modules or a CSS-in-JS library. `styles` holds per-element
// style objects (referenced as style={styles.foo} across the view
// components in this folder); `css` holds the handful of rules that need
// hover/focus/media-query behavior, which inline styles can't express.
export const styles = {
  app: { display: "flex", minHeight: "100vh", height: "100vh", width: "100vw", overflow: "hidden", background: "#0e1319", color: "#eef1f4", fontFamily: "'Inter', system-ui, sans-serif" },
  sidebar: { width: 240, background: "#12181f", borderRight: "1px solid #1f2933", padding: "22px 16px", display: "flex", flexDirection: "column", gap: 22, flexShrink: 0, position: "sticky", top: 0, height: "100vh", overflowY: "auto", alignSelf: "flex-start" },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  brandMark: { width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#e8a33d,#c97a2e)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 13, color: "#12181f" },
  brandTitle: { fontWeight: 600, fontSize: 14 },
  brandSub: { fontSize: 11.5, color: "#7c8794" },
  nav: { display: "flex", flexDirection: "column", gap: 4 },
  sideStat: { background: "#171f28", border: "1px solid #232d38", borderRadius: 10, padding: "12px 14px" },
  responsiveGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 },
  sideStatLabel: { fontSize: 11, color: "#7c8794", textTransform: "uppercase", letterSpacing: 0.5 },
  sideStatValue: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, marginTop: 2 },
  main: { flex: 1, padding: "30px 24px 30px", maxWidth: "100%", minWidth: 0, overflowY: "auto", height: "100vh" },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 18, flexWrap: "wrap" },
  topActions: { display: "flex", gap: 8 },
  h1: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 700, margin: 0 },
  h2: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 600, margin: "10px 0 4px" },
  subtle: { color: "#9aa3b6", fontSize: 13, margin: "4px 0 0" },
  statRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 22, marginBottom: 26 },
  statCard: { background: "#141b23", border: "1px solid #232d38", borderRadius: 14, padding: "18px 20px" },
  statCardIcon: { width: 30, height: 30, borderRadius: 8, background: "rgba(232,163,61,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  statCardValue: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 26, fontWeight: 700, lineHeight: 1.1 },
  statCardLabel: { fontSize: 12, color: "#8b96a3", marginTop: 6 },
  statCardRing: { display: "flex", alignItems: "center", gap: 12 },
  sectionSplit: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 8 },
  dashboardSection: { background: "#12181f", border: "1px solid #1f2933", borderRadius: 14, padding: 20 },
  sectionTitleRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 13.5, fontWeight: 600, color: "#dbe1e6" },
  barList: { display: "flex", flexDirection: "column", gap: 12 },
  notAuditedHeaderRow: { display: "flex", justifyContent: "space-between", paddingBottom: 6, borderBottom: "1px solid #232d38" },
  notAuditedHeaderLabel: { fontSize: 10.5, color: "#7c8794", textTransform: "uppercase", letterSpacing: 0.4 },
  notAuditedList: { display: "flex", flexDirection: "column" },
  notAuditedRow: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #171f28", fontSize: 13 },
  barRow: { display: "grid", gridTemplateColumns: "140px 1fr auto 32px", alignItems: "center", gap: 10 },
  barLabel: { fontSize: 13, color: "#c3cbd6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  barTrack: { height: 8, borderRadius: 99, background: "#1c2530", overflow: "hidden" },
  barFill: { height: "100%", background: "linear-gradient(90deg,#e8a33d,#c97a2e)", borderRadius: 99, transition: "width 0.3s ease" },
  barValue: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: "#8b96a3", textAlign: "right" },
  barScoreBadge: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11.5, fontWeight: 600, minWidth: 42, textAlign: "right" },
  metaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 4 },
  metaGridAudit: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 4 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  fieldLabel: { fontSize: 11.5, color: "#7c8794", textTransform: "uppercase", letterSpacing: 0.4 },
  segmented: { display: "flex", gap: 6, flexWrap: "wrap" },
  scorePanel: { display: "flex", alignItems: "center", gap: 20, background: "#171f28", border: "1px solid #232d38", borderRadius: 14, padding: "18px 22px", marginTop: 22 },
  scoreBig: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 30, fontWeight: 700 },
  progressWrap: { flex: 1, marginLeft: 10 },
  progressLabel: { fontSize: 12, color: "#8b96a3", marginBottom: 6 },
  progressTrack: { height: 6, borderRadius: 99, background: "#232d38", overflow: "hidden" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#e8a33d,#c97a2e)", borderRadius: 99, transition: "width 0.3s ease" },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "#171f28", border: "1px solid #232d38", borderRadius: 10, padding: "9px 12px", marginTop: 22 },
  searchInput: { background: "transparent", border: "none", outline: "none", color: "#eef1f4", fontSize: 13, width: "100%" },
  domainSectionHeader: { display: "flex", justifyContent: "space-between", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 15, padding: "0 4px 8px", borderBottom: "1px solid #1f2933" },
  formSectionLabel: { fontSize: 11.5, fontWeight: 700, color: "#e8a33d", textTransform: "uppercase", letterSpacing: 0.5, padding: "0 4px 6px" },
  categoryCard: { border: "1px solid #1f2933", borderRadius: 12, marginTop: 12, overflow: "hidden", background: "#12181f" },
  categoryName: { fontWeight: 600, fontSize: 13.5, flex: 1, textAlign: "left", display: "flex", alignItems: "center", gap: 8 },
  categoryCount: { fontSize: 11.5, color: "#7c8794", marginRight: 14 },
  categoryScore: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 600 },
  coreTag: { fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", background: "rgba(232,163,61,0.18)", color: "#e8a33d", padding: "2px 6px", borderRadius: 5 },
  itemList: { borderTop: "1px solid #1f2933" },
  itemRow: { padding: "14px 18px", borderBottom: "1px solid #171f28" },
  itemTop: { display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  itemText: { fontSize: 13.5, color: "#dbe1e6" },
  weightTag: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: "#7c8794" },
  itemControls: { display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" },
  commentInput: { flex: 1, minWidth: 200, background: "#171f28", border: "1px solid #232d38", borderRadius: 8, padding: "7px 10px", color: "#eef1f4", fontSize: 12.5, outline: "none" },
  validationHint: { marginTop: 6, color: "#e08480", fontSize: 11, lineHeight: 1.3 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1c242e", border: "1px solid #2c3742", color: "#eef1f4", padding: "10px 18px", borderRadius: 10, fontSize: 13 },
  emptyState: { textAlign: "center", padding: "60px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  table: { marginTop: 18, border: "1px solid #1f2933", borderRadius: 12, overflowX: "auto", overflowY: "hidden" },
  tableHeadRow: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 0.9fr 0.7fr 0.9fr", padding: "12px 16px", background: "#10161f", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.4, color: "#7c8794", minWidth: 640 },
  tableRow: { display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 0.9fr 0.7fr 0.9fr", padding: "14px 16px", borderTop: "1px solid #1c2430", fontSize: 13, alignItems: "center", background: "#121a24", transition: "background 0.2s ease", minWidth: 640 },
  dashboardRow: { cursor: "pointer" },
  tableProject: { fontWeight: 600 },
  rowActions: { display: "flex", gap: 6, justifyContent: "flex-end" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14, marginTop: 20 },
  projectCard: { border: "1px solid #1f2933", borderRadius: 12, padding: 16, background: "#12181f" },
  projectCardTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  projectName: { fontWeight: 600, fontSize: 14.5 },
  domainBadgeRow: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 },
  domainBadge: { fontSize: 11, background: "#1d2632", color: "#c9b28a", padding: "3px 9px", borderRadius: 99, border: "1px solid #2a3440" },
  typeBadge: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.3, background: "rgba(232,163,61,0.14)", color: "#e8a33d", padding: "3px 9px", borderRadius: 99 },
  editorPanel: { border: "1px solid #2a3440", background: "#141b23", borderRadius: 12, padding: 18, marginTop: 6, marginBottom: 20 },
  checkGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 },
  templateSectionLabel: { fontSize: 13, fontWeight: 700, color: "#e8a33d", borderBottom: "1px solid #232d38", paddingBottom: 6 },
  templateCatLabel: { fontSize: 11.5, color: "#7c8794", textTransform: "uppercase", letterSpacing: 0.4, margin: "10px 0 6px" },
  templateRow: { display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #171f28" },
  templateItemText: { flex: 1, fontSize: 13 },
  addItemRow: { display: "flex", gap: 8, marginTop: 14, alignItems: "center", flexWrap: "wrap" },
  bulkPanel: { border: "1px solid #2a3440", background: "#141b23", borderRadius: 10, padding: 14, marginTop: 10 },
  bulkTextarea: { width: "100%", background: "#0e1319", border: "1px solid #232d38", borderRadius: 8, padding: 10, color: "#eef1f4", fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", outline: "none", resize: "vertical", boxSizing: "border-box" },
  reportWarning: { display: "flex", alignItems: "center", gap: 8, background: "rgba(224,132,128,0.12)", border: "1px solid #5a3230", color: "#e08480", borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 4 },
  reportSheet: { background: "#fdfcfa", color: "#1a1a1a", borderRadius: 12, padding: "36px 40px", marginTop: 18 },
  reportPieWrap: { display: "flex", alignItems: "flex-start", gap: 30, marginTop: 10 },
  reportPieLegend: { display: "flex", flexDirection: "column" },
  reportPieDomainLabel: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.4, color: "#8a8272", margin: "6px 0 4px" },
  reportPieLegendItem: { display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, minWidth: 220 },
  reportPieSwatch: { width: 10, height: 10, borderRadius: 3, flexShrink: 0 },
  reportPieLabel: { color: "#333" },
  reportPieValue: { fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, marginLeft: "auto", paddingLeft: 16 },
  reportHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #1a1a1a", paddingBottom: 14 },
  reportTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, fontWeight: 700 },
  reportMetaGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, fontSize: 12.5, marginTop: 14, color: "#333" },
  reportSectionLabel: { fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#8a8272", marginBottom: 4 },
  reportCatHeader: { display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 13, borderBottom: "1px solid #ccc", paddingBottom: 4, marginBottom: 6, fontFamily: "'IBM Plex Mono', monospace" },
  reportRow: { display: "flex", alignItems: "center", gap: 8, padding: "4px 0", fontSize: 12.5 },
  reportStatusDot: { width: 7, height: 7, borderRadius: 99, flexShrink: 0 },
  reportItemText: { flex: 1 },
  reportStatusText: { fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, width: 60, textAlign: "right" },
  reportComment: { fontSize: 11, color: "#666", fontStyle: "italic", width: 200, textAlign: "left" },
};

export const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600;700&display=swap');
.navBtn { display:flex; align-items:center; gap:9px; padding:9px 12px; border-radius:9px; border:none; background:transparent; color:#aab4bf; font-size:13px; font-weight:500; cursor:pointer; text-align:left; }
.navBtn:hover { background:#171f28; color:#eef1f4; }
.navBtnActive { background:#1d2632; color:#e8a33d; }
.primaryBtn { display:flex; align-items:center; gap:7px; background:linear-gradient(135deg,#e8a33d,#c97a2e); color:#12181f; border:none; padding:9px 16px; border-radius:9px; font-weight:600; font-size:13px; cursor:pointer; white-space:nowrap; }
.primaryBtn:hover { filter:brightness(1.06); }
.primaryBtn:disabled { opacity:0.5; cursor:not-allowed; }
.ghostBtn { display:flex; align-items:center; gap:6px; background:transparent; color:#aab4bf; border:1px solid #2a3440; padding:9px 14px; border-radius:9px; font-size:13px; cursor:pointer; }
.ghostBtn:hover { border-color:#3a4552; color:#eef1f4; }
.linkBtn { background:none; border:none; padding:0; color:#e8a33d; font-size:12.5px; font-weight:600; cursor:pointer; text-decoration:underline; }
.linkBtn:hover { color:#f0b558; }
.statusBtn { padding:6px 12px; border-radius:7px; border:1px solid; font-size:12px; font-weight:600; cursor:pointer; }
.categoryHeader { display:flex; align-items:center; gap:10px; width:100%; padding:14px 18px; background:transparent; border:none; color:#eef1f4; cursor:pointer; }
.categoryHeader:hover { background:#151b23; }
.typeTag { font-size:10px; font-weight:700; padding:2px 7px; border-radius:5px; text-transform:uppercase; letter-spacing:0.3px; }
.typeTagMand { background:rgba(194,84,80,0.15); color:#e08480; }
.typeTagOpt { background:rgba(91,101,114,0.25); color:#9aa5b1; }
.iconBtn { background:#171f28; border:1px solid #232d38; color:#aab4bf; padding:6px; border-radius:7px; cursor:pointer; display:flex; }
.iconBtn:hover { color:#eef1f4; border-color:#3a4552; }
.iconBtnDanger { color:#e08480; border-color:#5a3230; }
.checkPill { display:flex; align-items:center; gap:6px; border:1px solid #2a3440; border-radius:99px; padding:6px 12px; font-size:12.5px; cursor:pointer; }
input, select, textarea { background:#171f28; border:1px solid #232d38; border-radius:8px; padding:9px 11px; color:#eef1f4; font-size:13px; outline:none; width:100%; box-sizing:border-box; font-family:'Inter',sans-serif; }
input:focus, select:focus, textarea:focus { border-color:#e8a33d; }
input[type=date] { color-scheme: dark; }
input[type=checkbox] { width:auto !important; }
@media print {
  .noPrint, .sidebar { display:none !important; }
  body { background:white; }
  .app, .main { height:auto !important; overflow:visible !important; background:white !important; color:#1a1a1a !important; }
}
.spinner { width:28px; height:28px; border:3px solid #232d38; border-top-color:#e8a33d; border-radius:50%; margin:0 auto; animation:spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Below this width the fixed 240px sidebar leaves too little room for
   content, so the layout switches from a side-by-side split (each pane
   scrolling independently) to a normal stacked page (nav on top, page
   itself scrolls). Inline styles win over plain CSS, so these need
   !important to actually override style={styles.app / .sidebar / .main}. */
@media (max-width: 720px) {
  .app { flex-direction: column !important; height: auto !important; min-height: 100vh !important; width: 100% !important; overflow: visible !important; }
  .sidebar { width: 100% !important; height: auto !important; position: relative !important; top: auto !important; overflow: visible !important; flex-direction: row !important; flex-wrap: wrap !important; align-items: center !important; padding: 14px 16px !important; gap: 10px 16px !important; border-right: none !important; border-bottom: 1px solid #1f2933; }
  .sidebar nav { flex-direction: row !important; flex-wrap: wrap !important; gap: 6px !important; }
  .main { height: auto !important; max-width: 100% !important; padding: 20px 16px 48px !important; }
}
`;
