import {
  loadExperiments,
  statusLabel,
  statusClass,
  experimentDetailUrl,
  collectTags,
  collectStatuses,
  filterExperiments,
} from "./lib/experiments.js";
import {
  loadConfig,
  encodeEmail,
  decodeEmail,
  getTemplateMailto,
} from "./lib/config.js";
import "./styles/main.css";

function renderExperimentCard(exp) {
  const help = (exp.helpWanted || []).join(", ");
  const tags = (exp.tags || [])
    .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
    .join("");
  return `
    <li>
      <article class="experiment-card">
        <div class="card-meta">
          <span class="badge ${statusClass(exp.status)}">${escapeHtml(statusLabel(exp.status))}</span>
          ${tags}
        </div>
        <h3><a href="${experimentDetailUrl(exp.id)}">${escapeHtml(exp.title)}</a></h3>
        <p class="card-question">${escapeHtml(exp.question)}</p>
        <p class="card-help">Help wanted: ${escapeHtml(help)}</p>
        <a class="card-link" href="${experimentDetailUrl(exp.id)}">Read more</a>
      </article>
    </li>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function initList() {
  const listEl = document.getElementById("experiment-list");
  const emptyEl = document.getElementById("experiment-empty");
  const countEl = document.getElementById("experiment-count");
  const statusSelect = document.getElementById("filter-status");
  const tagSelect = document.getElementById("filter-tag");
  const clearBtn = document.getElementById("clear-filters");

  if (!listEl) return;

  const experiments = await loadExperiments();

  for (const status of collectStatuses(experiments)) {
    const opt = document.createElement("option");
    opt.value = status;
    opt.textContent = statusLabel(status);
    statusSelect.appendChild(opt);
  }

  for (const tag of collectTags(experiments)) {
    const opt = document.createElement("option");
    opt.value = tag;
    opt.textContent = tag;
    tagSelect.appendChild(opt);
  }

  function update() {
    const filtered = filterExperiments(experiments, {
      status: statusSelect.value,
      tag: tagSelect.value,
    });
    countEl.textContent = `Showing ${filtered.length} of ${experiments.length}`;
    listEl.innerHTML = filtered.map(renderExperimentCard).join("");
    emptyEl.classList.toggle("hidden", filtered.length > 0);
  }

  statusSelect.addEventListener("change", update);
  tagSelect.addEventListener("change", update);
  clearBtn.addEventListener("click", () => {
    statusSelect.value = "";
    tagSelect.value = "";
    update();
  });

  update();
}

async function initContact() {
  const config = await loadConfig();
  const email = config.contactEmail;
  const encoded = encodeEmail(email);

  const link = document.getElementById("contact-email-link");
  const reveal = document.getElementById("reveal-email");

  let revealed = false;
  function applyEmailToDom(decoded) {
    link.textContent = decoded;
    link.href = `mailto:${decoded}`;
    link.removeAttribute("data-obfuscate");
    revealed = true;
    reveal.textContent = "Hide";
  }

  link.textContent = encoded.replace("@", " [at] ");
  link.dataset.obfuscate = encoded;
  link.href = "#";

  reveal.addEventListener("click", () => {
    if (revealed) {
      link.textContent = encoded.replace("@", " [at] ");
      link.href = "#";
      link.dataset.obfuscate = encoded;
      revealed = false;
      reveal.textContent = "Show address";
      return;
    }
    applyEmailToDom(decodeEmail(encoded));
  });

  document.querySelectorAll("[data-email-template]").forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const decoded = revealed ? email : decodeEmail(encoded);
      const template = anchor.getAttribute("data-email-template");
      window.location.href = getTemplateMailto(
        decoded,
        template,
        undefined,
        config.siteName || "Arc-9 Research",
      );
    });
  });

  const endpoint = (config.formspreeEndpoint || "").trim();
  const formBlock = document.getElementById("contact-form-block");
  const form = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (endpoint) {
    formBlock.classList.remove("hidden");
    formBlock.setAttribute("aria-hidden", "false");
    form.action = endpoint;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      formStatus.textContent = "Sending…";
      const fd = new FormData(form);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          body: fd,
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          form.reset();
          formStatus.textContent = "Thanks — your message was sent.";
        } else {
          formStatus.textContent = "Something went wrong. Try email instead.";
        }
      } catch {
        formStatus.textContent = "Network error. Try email instead.";
      }
    });
  }
}

function initYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

initYear();
initList().catch(console.error);
initContact().catch(console.error);