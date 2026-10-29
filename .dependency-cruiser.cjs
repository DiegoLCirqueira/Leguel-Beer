/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
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
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    exclude: { path: "(^|/)(dist|\\.next|\\.turbo|node_modules)/" },
  },
};
