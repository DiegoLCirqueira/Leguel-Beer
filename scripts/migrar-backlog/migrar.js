// Migra para o GitHub Issues os épicos marcados como MVP em docs/01-produto/mvp-corte.md.
// Script de uso único: apague a pasta scripts/migrar-backlog/ depois da migração.
//
// Uso (na raiz do repositório):
//   node scripts/migrar-backlog/migrar.js                 simulação (padrão): só imprime o que faria
//   node scripts/migrar-backlog/migrar.js --executar      cria labels e issues de verdade
//   --repo dono/nome                                      repositório (padrão: o remote origin)
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const raiz = path.resolve(__dirname, "../..");
const args = process.argv.slice(2);
const executar = args.includes("--executar");
const repo = args.includes("--repo") ? args[args.indexOf("--repo") + 1] : repoDoOrigin();

const CORES = { tipo: "1d76db", area: "5319e7", "prio:p0": "b60205", "prio:p1": "d93f0b", "prio:p2": "fbca04", "prio:p3": "0e8a16", epic: "3e4b9e", adiavel: "ededed" };
const corDa = (label) => CORES[label] || CORES[label.split(":")[0]] || "c5def5";

function gh(argsGh, entrada) {
  return execFileSync("gh", argsGh, { encoding: "utf8", input: entrada, stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function repoDoOrigin() {
  const url = execFileSync("git", ["remote", "get-url", "origin"], { cwd: raiz, encoding: "utf8" }).trim();
  return url.replace(/^.*github\.com[:/]/, "").replace(/\.git$/, "");
}

function lerCorte() {
  const md = fs.readFileSync(path.join(raiz, "docs/01-produto/mvp-corte.md"), "utf8");
  const aprovado = /^aprovado:\s*true\s*$/m.test(md);
  const grupos = {};
  const cardsPosMvp = new Set();
  const cardsAdiaveis = new Set();
  let secao = "";
  for (const linha of md.split(/\r?\n/)) {
    if (linha.startsWith("## ")) secao = linha.slice(3).trim();
    const c = linha.split("|").map((s) => s.trim());
    if (secao === "Épicos" && /^E\d+$/.test(c[1] || "")) grupos[c[1]] = c[6];
    const codigo = (c[2] || "").match(/^LB-\d+/);
    if (codigo && secao === "Cards Pós-MVP") cardsPosMvp.add(codigo[0]);
    if (codigo && secao === "Cards adiáveis") cardsAdiaveis.add(codigo[0]);
  }
  return { aprovado, grupos, cardsPosMvp, cardsAdiaveis };
}

function lerEstadoDoGitHub() {
  try {
    gh(["auth", "status"]);
  } catch {
    console.warn("! gh não autenticado: a simulação assume que nada existe no GitHub.\n");
    return { labels: new Set(), issuesPorNotionId: new Map(), online: false };
  }
  const labels = new Set(
    gh(["api", "--paginate", `repos/${repo}/labels?per_page=100`, "--jq", ".[].name"]).split("\n").filter(Boolean).map((l) => l.toLowerCase())
  );
  const linhas = gh([
    "api", "--paginate", `repos/${repo}/issues?state=all&per_page=100`, "--jq",
    '.[] | select(.pull_request | not) | [.number, .id, ((.body // "") | [match("notion-id: ([0-9a-f]{32})").captures[0].string] | first // "")] | @tsv',
  ]).split("\n").filter(Boolean);
  const issuesPorNotionId = new Map();
  for (const linha of linhas) {
    const [numero, id, notionId] = linha.split("\t");
    if (notionId) issuesPorNotionId.set(notionId, { numero: Number(numero), id: Number(id) });
  }
  return { labels, issuesPorNotionId, online: true };
}

function corpoDoEpico(epico, filhos) {
  return [
    `Épico do Notion: [${epico.nome}](https://app.notion.com/p/${epico.notionId})`,
    "",
    `- Prioridade no Notion: ${epico.prioridade}`,
    `- Cards: ${filhos.length} (${filhos.reduce((s, c) => s + c.pontos, 0)} pontos), vinculados como sub-issues`,
    "",
    "Corte do MVP: `docs/01-produto/mvp-corte.md`.",
    "",
    `<!-- notion-id: ${epico.notionId} -->`,
  ].join("\n");
}

function corpoDoCard(card, epico) {
  return [
    `Card do Notion: [${card.codigo}](https://app.notion.com/p/${card.notionId})`,
    "",
    `- Épico: ${epico.nome}`,
    `- Status no Notion: ${card.status}`,
    `- Prioridade: ${card.prioridade}`,
    `- Pontos: ${card.pontos}`,
    "",
    "Resumo, critérios BDD e plano de testes estão no card do Notion. A spec do vault fica em `docs/02-features/` quando existir.",
    "",
    `<!-- notion-id: ${card.notionId} -->`,
  ].join("\n");
}

function criarIssue(titulo, corpo, labels) {
  const resposta = JSON.parse(gh(["api", `repos/${repo}/issues`, "--method", "POST", "--input", "-"], JSON.stringify({ title: titulo, body: corpo, labels })));
  return { numero: resposta.number, id: resposta.id };
}

function main() {
  const { epicos, cards } = JSON.parse(fs.readFileSync(path.join(__dirname, "backlog.json"), "utf8"));
  const corte = lerCorte();
  if (executar && !corte.aprovado) {
    console.error("Abortado: mvp-corte.md ainda não está aprovado (frontmatter `aprovado: true`).");
    process.exit(1);
  }

  const epicosMvp = epicos.filter((e) => corte.grupos[e.id] === "MVP");
  // Cards Pós-MVP ficam de fora mesmo em épicos MVP; adiáveis entram com a label `adiavel`.
  const cardsMvp = cards
    .filter((c) => epicosMvp.some((e) => e.id === c.epico) && !corte.cardsPosMvp.has(c.codigo))
    .map((c) => (corte.cardsAdiaveis.has(c.codigo) ? { ...c, labels: [...c.labels, "adiavel"] } : c));
  const estado = lerEstadoDoGitHub();
  const prefixo = executar ? "" : "[simulação] ";
  const resumo = { labels: 0, epicos: 0, cards: 0, subIssues: 0, jaExistiam: 0 };

  const adiaveis = cardsMvp.filter((c) => corte.cardsAdiaveis.has(c.codigo)).length;
  console.log(
    `${executar ? "EXECUTANDO" : "SIMULAÇÃO"} em ${repo}: ${epicosMvp.length} épicos MVP, ${cardsMvp.length} cards ` +
      `(${adiaveis} adiáveis; ${corte.cardsPosMvp.size} cards Pós-MVP ignorados).\n`
  );

  const labelsNecessarias = [...new Set([...epicosMvp, ...cardsMvp].flatMap((x) => x.labels))].sort();
  for (const label of labelsNecessarias) {
    if (estado.labels.has(label.toLowerCase())) continue;
    console.log(`${prefixo}label ${label}`);
    if (executar) gh(["label", "create", label, "--repo", repo, "--color", corDa(label)]);
    resumo.labels++;
  }

  for (const epico of epicosMvp) {
    const filhos = cardsMvp.filter((c) => c.epico === epico.id);
    let issueEpico = estado.issuesPorNotionId.get(epico.notionId);
    if (issueEpico) {
      resumo.jaExistiam++;
    } else {
      console.log(`${prefixo}épico "[Épico] ${epico.nome}" (${filhos.length} cards)`);
      if (executar) issueEpico = criarIssue(`[Épico] ${epico.nome}`, corpoDoEpico(epico, filhos), epico.labels);
      resumo.epicos++;
    }

    const subIssuesExistentes = new Set(
      executar && issueEpico && estado.online
        ? gh(["api", `repos/${repo}/issues/${issueEpico.numero}/sub_issues?per_page=100`, "--jq", ".[].id"]).split("\n").filter(Boolean).map(Number)
        : []
    );
    for (const card of filhos) {
      let issueCard = estado.issuesPorNotionId.get(card.notionId);
      if (issueCard) {
        resumo.jaExistiam++;
      } else {
        console.log(`${prefixo}  issue "[${card.codigo}] ${card.titulo}" ${card.labels.join(" ")}`);
        if (executar) issueCard = criarIssue(`[${card.codigo}] ${card.titulo}`, corpoDoCard(card, epico), card.labels);
        resumo.cards++;
      }
      if (issueCard && subIssuesExistentes.has(issueCard.id)) continue;
      if (executar) gh(["api", `repos/${repo}/issues/${issueEpico.numero}/sub_issues`, "--method", "POST", "-F", `sub_issue_id=${issueCard.id}`]);
      resumo.subIssues++;
    }
  }

  console.log(
    `\n${executar ? "Criados" : "Seriam criados"}: ${resumo.labels} labels, ${resumo.epicos} épicos, ${resumo.cards} issues de card, ` +
      `${resumo.subIssues} vínculos de sub-issue. Já existiam no GitHub: ${resumo.jaExistiam}.`
  );
  if (!executar) console.log(`Corte aprovado: ${corte.aprovado ? "sim" : "não (a execução real será recusada)"}.`);
}

main();
