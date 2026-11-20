import { withBase } from "./paths.js";

let cachedConfig = null;

export async function loadConfig() {
  if (cachedConfig) return cachedConfig;
  const res = await fetch(withBase("site-config.json"));
  if (!res.ok) throw new Error("Failed to load site config");
  cachedConfig = await res.json();
  return cachedConfig;
}

/** Rot13 + reversed local part — mild obfuscation, decoded in the browser. */
export function encodeEmail(email) {
  const rot13 = (s) =>
    s.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  const [local, domain] = email.split("@");
  return `${rot13(local.split("").reverse().join(""))}@${domain}`;
}

export function decodeEmail(encoded) {
  const rot13 = (s) =>
    s.replace(/[a-zA-Z]/g, (c) => {
      const base = c <= "Z" ? 65 : 97;
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
    });
  const [local, domain] = encoded.split("@");
  return `${rot13(local).split("").reverse().join("")}@${domain}`;
}

export function buildMailto(email, { subject, body } = {}) {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const q = params.toString();
  return `mailto:${email}${q ? `?${q}` : ""}`;
}

function subjectFor(template, siteName = "Arc-9 Research") {
  const map = {
    "related-work": `Related work / data — ${siteName}`,
    collaborate: `Collaboration — ${siteName}`,
    fund: `Funding — ${siteName}`,
  };
  return map[template] || `Open research — ${siteName}`;
}

export function getTemplateMailto(email, template, experimentTitle, siteName) {
  const subject = subjectFor(template, siteName);
  const lines = [
    "Hi Grayson,",
    "",
    template === "related-work"
      ? "I have done work that may relate to your open questions."
      : template === "collaborate"
        ? "I would like to explore collaboration."
        : "I am interested in funding part of your open research.",
  ];
  if (experimentTitle) {
    lines.push("", `Experiment: ${experimentTitle}`);
  }
  lines.push("", "—");
  return buildMailto(email, { subject, body: lines.join("\n") });
}