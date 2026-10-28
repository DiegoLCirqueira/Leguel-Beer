// Converte as tabelas de docs/00-inbox/backlog-snapshot.md em backlog.json.
// Uso (na raiz do repositório): node scripts/migrar-backlog/gerar-json.js
const fs = require("fs");
const path = require("path");

const raiz = path.resolve(__dirname, "../..");
const snapshot = fs.readFileSync(path.join(raiz, "docs/00-inbox/backlog-snapshot.md"), "utf8");

const celulas = (linha) =>
  linha.trim().replace(/^\|/, "").replace(/\|$/, "").split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, "|"));
const link = (celula) => celula.match(/^\[(.+)\]\(https:\/\/app\.notion\.com\/p\/([0-9a-f]{32})\)$/);
const labels = (celula) => [...celula.matchAll(/`([^`]+)`/g)].map((m) => m[1]).filter((l) => !l.startsWith("["));

const epicos = [];
const cards = [];
for (const linha of snapshot.split(/\r?\n/)) {
  if (!linha.startsWith("|")) continue;
  const c = celulas(linha);
  if (/^E\d+$/.test(c[0])) {
    const [, nome, notionId] = link(c[1]);
    epicos.push({ id: c[0], nome, notionId, prioridade: c[2], labels: labels(c[5]) });
  } else if (link(c[0])) {
    const [, codigo, notionId] = link(c[0]);
    cards.push({ codigo, titulo: c[1], notionId, status: c[2], prioridade: c[3], pontos: Number(c[4]), epico: c[5], labels: labels(c[6]) });
  }
}

const saida = path.join(__dirname, "backlog.json");
fs.writeFileSync(saida, JSON.stringify({ fonte: "docs/00-inbox/backlog-snapshot.md", epicos, cards }, null, 2) + "\n");
console.log(`backlog.json: ${epicos.length} épicos, ${cards.length} cards`);
