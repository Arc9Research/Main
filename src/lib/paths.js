/** Vite `base` (always ends with `/`). */
export function basePath() {
  const base = import.meta.env.BASE_URL || "/";
  return base.endsWith("/") ? base : `${base}/`;
}

export function withBase(path) {
  const clean = path.startsWith("/") ? path.slice(1) : path;
  return `${basePath()}${clean}`;
}

export function homeUrl(hash = "") {
  const h = hash ? (hash.startsWith("#") ? hash : `#${hash}`) : "";
  return `${basePath()}index.html${h}`;
}