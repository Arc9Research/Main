import { readFileSync, mkdirSync, writeFileSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const experiments = JSON.parse(
  readFileSync(join(root, "data/experiments.json"), "utf8"),
).experiments;

const outDir = join(root, "public", "experiments");
mkdirSync(join(root, "public", "data"), { recursive: true });
mkdirSync(outDir, { recursive: true });
cpSync(join(root, "data/experiments.json"), join(root, "public/data/experiments.json"), {
  force: true,
});
cpSync(join(root, "site-config.json"), join(root, "public/site-config.json"), { force: true });

const manifest = experiments.map((e) => ({
  id: e.id,
  path: `/experiments/${e.id}/`,
}));

writeFileSync(
  join(root, "public/data/experiment-index.json"),
  JSON.stringify(manifest, null, 2),
);

const redirectHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Redirecting…</title>
    <script>
      (function () {
        var m = location.pathname.match(/^(.*\\/experiments)\\/([^/]+)\\/?$/);
        if (m) {
          var prefix = m[1].replace(/\\/experiments$/, "");
          location.replace(prefix + "/experiment.html?slug=" + encodeURIComponent(m[2]));
        } else {
          location.replace("../experiment.html");
        }
      })();
    </script>
  </head>
  <body></body>
</html>`;

for (const exp of experiments) {
  const dir = join(outDir, exp.id);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), redirectHtml);
}

console.log(`Generated ${experiments.length} experiment path stubs.`);