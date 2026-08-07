export function pointsFor(status, weight) {
  if (status === "Yes") return weight;
  if (status === "Partial") return weight / 2;
  if (status === "No") return 0;
  return null; // N/A or unanswered — excluded from both numerator and denominator
}

export function scoreFor(items, answers) {
  let earned = 0, possible = 0;
  items.forEach((q) => {
    const status = answers[q.id]?.status;
    if (!status || status === "N/A") return;
    possible += q.weight;
    earned += pointsFor(status, q.weight);
  });
  return possible === 0 ? null : earned / possible;
}

export function pct(v) {
  return v === null || v === undefined ? "—" : `${Math.round(v * 1000) / 10}%`;
}

export function scoreColor(score) {
  if (score === null || score === undefined) return "#5b6572";
  if (score >= 0.9) return "#4c9a6a";
  if (score >= 0.75) return "#d1a13f";
  return "#c25450";
}

export const uid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
