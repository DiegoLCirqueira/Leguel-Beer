/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "shared-sem-node-nem-framework",
      comment:
        "packages/shared roda no navegador e na API: não importa módulo do Node, Nest, Next, React nem Prisma (contratos-compartilhados).",
      severity: "error",
      from: { path: "^packages/shared/src/", pathNot: "\\.test\\.ts$" },
      to: {
        dependencyTypes: ["core"],
      },
    },
    {
      name: "shared-sem-framework",
      comment:
        "Mesma proteção para os pacotes de framework, resolvidos em node_modules ou não (contratos-compartilhados).",
      severity: "error",
      from: { path: "^packages/shared/src/", pathNot: "\\.test\\.ts$" },
      to: {
        path: "(^|/)node_modules/(@nestjs|next|react|react-dom|@prisma|express)(/|$)|^(@nestjs|next|react|react-dom|@prisma|express)(/|$)",
      },
    },
    {
      name: "domain-sem-framework",
      comment:
        "A camada domain de apps/api não importa framework nem pacote externo (ADR-005). Nenhum pacote está na lista permitida no LB-1.",
      severity: "error",
      from: { path: "^apps/api/src/modules/[^/]+/domain/" },
      to: {
        dependencyTypes: [
          "npm",
          "npm-dev",
          "npm-peer",
          "npm-optional",
          "npm-unknown",
          "core",
          "unknown",
          "undetermined",
        ],
      },
    },
    {
      name: "domain-so-depende-de-domain",
      comment: "domain não importa application, infrastructure nem presentation (ADR-005).",
      severity: "error",
      from: { path: "^apps/api/src/modules/([^/]+)/domain/" },
      to: { path: "^apps/api/src/modules/[^/]+/(application|infrastructure|presentation)/" },
    },
    {
      name: "application-sem-framework",
      comment:
        "application não importa @nestjs, @prisma nem a infraestrutura comum (common/prisma, common/http, common/logging); ela fala com o mundo por portas (ADR-005).",
      severity: "error",
      from: { path: "^apps/api/src/modules/[^/]+/application/" },
      to: {
        path: [
          "(^|/)node_modules/@nestjs/",
          "(^|/)node_modules/@prisma/",
          "^apps/api/src/common/(prisma|http|logging)/",
        ],
      },
    },
    {
      name: "application-so-depende-de-domain",
      comment:
        "application importa só domain; infrastructure e presentation dependem dela, não o contrário (ADR-005).",
      severity: "error",
      from: { path: "^apps/api/src/modules/[^/]+/application/" },
      to: { path: "^apps/api/src/modules/[^/]+/(infrastructure|presentation)/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    exclude: { path: "(^|/)(dist|\\.next|\\.turbo|src/generated)/" },
  },
};
