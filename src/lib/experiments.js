import { withBase } from "./paths.js";

let cached = null;

export async function loadExperiments() {
  if (cached) return cached;
  const res = await fetch(withBase("data/experiments.json"));
  if (!res.ok) throw new Error("Failed to load experiments");
  const data = await res.json();
  cached = data.experiments;
  return cached;
}

export function statusLabel(status) {
  return status.replace(/-/g, " ");
}

export function statusClass(status) {
  const safe = status.replace(/\s+/g, "-").replace(/[^a-z-]/g, "");
  return `badge-status-${safe}`;
}

export function experimentDetailUrl(id) {
  return `${withBase("experiment.html")}?slug=${encodeURIComponent(id)}`;
}

export function collectTags(experiments) {
  const tags = new Set();
  for (const exp of experiments) {
    for (const tag of exp.tags || []) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

export function collectStatuses(experiments) {
  const statuses = new Set(experiments.map((e) => e.status));
  return [...statuses].sort();
}

export function filterExperiments(experiments, { status, tag }) {
  return experiments.filter((exp) => {
    if (status && exp.status !== status) return false;
    if (tag && !(exp.tags || []).includes(tag)) return false;
    return true;
  });
}