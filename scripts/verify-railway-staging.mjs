import { readFile } from "node:fs/promises";

const base = "https://inspire3d-web-staging.up.railway.app";
const admin = JSON.parse(await readFile(".data/railway-staging-admin.json", "utf8"));
const snapshot = JSON.parse(await readFile(".data/backups/pglite-2026-11-10T15-12-10-221Z/manifest.json", "utf8"));

async function checked(path, options = {}) {
  const response = await fetch(`${base}${path}`, { ...options, signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response;
}

const health = await checked("/api/health");
if (await health.text() !== "ok") throw new Error("Healthcheck retornou conteúdo inesperado.");

const catalog = await checked("/produtos");
if (!(await catalog.text()).includes("Caminho dos Guardiões")) throw new Error("Produto importado ausente do catálogo.");
await checked("/orcamento");

const session = await checked("/api/admin/session", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base },
  body: JSON.stringify({ email: admin.email, password: admin.password }),
});
const cookie = session.headers.get("set-cookie")?.split(";")[0];
if (!cookie) throw new Error("Login administrativo não definiu sessão.");
const authHeaders = { Cookie: cookie };

const products = await (await checked("/api/admin/products", { headers: authHeaders })).json();
const materials = await (await checked("/api/admin/materials", { headers: authHeaders })).json();
const sales = await (await checked("/api/admin/sales", { headers: authHeaders })).json();
if (!Array.isArray(products) || products.length !== snapshot.counts.products ||
    !Array.isArray(materials) || materials.length !== snapshot.counts.inventory_materials ||
    !Array.isArray(sales) || sales.length !== snapshot.counts.sales) {
  throw new Error("Contagens expostas pela aplicação divergem do snapshot.");
}

await checked("/admin", { headers: authHeaders });
const purchasesPage = await checked("/admin/compras", { headers: authHeaders });
const purchasesHtml = await purchasesPage.text();
if (!purchasesHtml.includes("Histórico de compras") ||
    !new RegExp(`${snapshot.counts.inventory_purchases}(?:<!-- -->)? linhas`).test(purchasesHtml)) {
  throw new Error(`Histórico de compras não corresponde ao snapshot (URL final: ${purchasesPage.url}, título: ${purchasesHtml.includes("Histórico de compras")}).`);
}
console.log(JSON.stringify({
  health: 200,
  catalog: 200,
  quotePage: 200,
  adminLogin: 200,
  adminPage: 200,
  purchasesPage: 200,
  counts: { products: products.length, materials: materials.length, sales: sales.length },
}, null, 2));
