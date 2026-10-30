---
tags: [inbox, followup]
---

# Follow-ups do front de [[identidade-visual]] (#130)

Itens aprovados com ressalva no #130, a tratar junto da próxima mudança nos componentes base.

- **Testes extras de contraste:** cobrir mais pares de tokens (por exemplo `texto-suave` sobre `fundo`, `erro`, `sucesso` e `aviso` com `texto-na-primaria`).
- **Regex do lint de cor fixa:** casos de borda (`#abc` dentro de URL ou de `url(#id)`, `rgb` em maiúsculas, nomes de cor CSS como `red`).
- **`role="group"` nos chips:** a faixa de categorias ainda não tem agrupamento com nome acessível.
- **Status do botão em carregamento:** o nome acessível vira "Carregando Entrar" porque o `role="status"` fica dentro do botão. Trocar por uma região viva sempre montada e vazia, que recebe o texto ao carregar, fora do nome do botão.
