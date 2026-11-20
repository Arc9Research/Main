import { loadExperiments, statusLabel, statusClass, experimentDetailUrl } from "./lib/experiments.js";
import { loadConfig, getTemplateMailto, decodeEmail, encodeEmail } from "./lib/config.js";
import { homeUrl } from "./lib/paths.js";
import "./styles/main.css";

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getSlug() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("slug")) return params.get("slug");
  const match = window.location.pathname.match(/\/experiments\/([^/]+)\/?$/);
  return match ? match[1] : null;
}

async function render() {
  const slug = getSlug();
  const container = document.getElementById("experiment-detail");
  const involve = document.getElementById("detail-involve");

  const experiments = await loadExperiments();
  const exp = experiments.find((e) => e.id === slug);

  if (!exp) {
    container.innerHTMl = `<p>Experiment not found. <a href="${homeUrl("experiments")}">Back to list</a></p>`;
    return;
  }

  const config = await loadConfig();
  const siteName = config.siteName || "Arc-9 Research";
  document.title = `${exp.title} — ${siteName}`;
  const ogTitle = document.getElementById("og-title");
  const ogDesc = document.getElementById("og-description");
  if (ogTitle) ogTitle.setAttribute("content", `${exp.title} — ${siteName}`);
  if (ogDesc) ogDesc.setAttribute("content", exp.question);

  const tags = (exp.tags || [])
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");
  const help = (exp.helpWanted || [])
    .map((h) => `<li>${escapeHtml(h)}</li>`)
    .join("");
  const links =
    (exp.relatedLinks || []).length > 0
      ? `<ul class="link-list">${(exp.relatedLinks || [])
          .map(
            (l) =>
              `<li><a href="${escapeHtml(l.url)}" rel="noopener noreferrer">${escapeHtml(l.label)}</a></li>`,
          )
          .join("")}</ul>`
      : "<p>None yet.</p>";

  container.innerHTML = `
    <header class="detail-header">
      <div class="card-meta">
        <span class="badge ${statusClass(exp.status)}">${escapeHtml(statusLabel(exp.status))}</span>
        ${tags}
      </div>
      <h1>${escapeHtml(exp.title)}</h1>
      <p class="detail-question">${escapeHtml(exp.question)}</p>
    </header>
    <section class="detail-block">
      <h2>Why it matters</h2>
      <p>${escapeHtml(exp.whyItMatters)}</p>
    </section>
    <section class="detail-block">
      <h2>What help is wanted</h2>
      <ul class="help-chips">${help}</ul>
      ${exp.helpNote ? `<p>${escapeHtml(exp.helpNote)}</p>` : ""}
    </section>
    <section class="detail-block">
      <h2>Related links</h2>
      ${links}
    </section>
  `;

  const email = decodeEmail(encodeEmail(config.contactEmail));
  const collabUrl = getTemplateMailto(email, "collaborate", exp.title, siteName);
  const dataUrl = getTemplateMailto(email, "related-work", exp.title, siteName);
  const fundUrl = getTemplateMailto(email, "fund", exp.title, siteName);

  involve.innerHTML = `
    <h3>Get involved with this question</h3>
    <p>
      <a class="btn btn-primary" href="${collabUrl}">Collaborate</a>
      <a class="btn btn-ghost" href="${dataUrl}">Share data</a>
      <a class="btn btn-ghost" href="${fundUrl}">Fund</a>
    </p>
    <p><a href="${homeUrl("contact")}">More contact options</a> · <a href="${experimentDetailUrl(exp.id)}">Permalink</a></p>
  `;
}

document.getElementById("year").textContent = String(new Date().getFullYear());
render().catch((err) => {
  console.error(err);
  document.getElementById("experiment-detail").innerHTML =
    "<p>Could not load this experiment.</p>";
});