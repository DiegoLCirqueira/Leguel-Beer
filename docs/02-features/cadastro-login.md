---
status: rascunho
modulo: conta
card-notion: https://app.notion.com/p/3fd490a7ac7d81709d51f352c2257c0b
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#40 LB-25"
tags:
  - feature
---

# Cadastro e login com e-mail e senha

> [!info] Origem
> Derivada do card do Notion **LB-25** (#40) e da tela "Criar sua conta" do Figma. O Supabase Auth roda local no desenvolvimento, com Supabase CLI e Docker, e os e-mails ficam presos no visualizador de e-mails do Supabase local; o projeto na nuvem e o envio real de e-mails ficam para o LB-8 (#17). O Figma não tem tela de entrar: ela segue o visual de "Criar sua conta". Login com Google e Facebook (LB-26) é MVP+ e fica fora.

## História de usuário

- **Como** convidado
- **Quero** criar uma conta e entrar nela com e-mail e senha
- **Para** poder finalizar compras e acompanhar meus pedidos

## Cenários

```gherkin
# language: pt
Funcionalidade: Cadastro e login com e-mail e senha

  Cenário: Cadastro válido com confirmação por e-mail
    Dado que estou em "Criar sua conta"
    Quando preencho nome completo, e-mail, telefone, senha e a confirmação da senha válidos
    E aceito os Termos de Uso e a Política de Privacidade
    E toco em "Criar conta"
    Então vejo o aviso de que enviamos um link de confirmação para o meu e-mail
    E o e-mail de confirmação chega em português
    E ao abrir o link entro na conta e meu perfil existe com o nome e o telefone informados

  Cenário: E-mail já cadastrado
    Dado que já existe uma conta com o e-mail "ana@exemplo.com"
    Quando tento criar uma conta com "ana@exemplo.com"
    Então vejo "Este e-mail já tem conta. Entrar?"
    E "Entrar" me leva à tela de entrar com o e-mail preenchido

  Esquema do Cenário: Formulário de cadastro inválido
    Dado que estou em "Criar sua conta" com todos os campos válidos
    Quando <alteração>
    E toco em "Criar conta"
    Então vejo a mensagem <mensagem> junto do campo <campo>
    E nenhuma conta é criada

    Exemplos:
      | alteração                                 | campo              | mensagem                                      |
      | deixo o nome completo vazio               | Nome completo      | "Informe seu nome completo."                  |
      | escrevo o e-mail "ana@"                   | E-mail             | "Informe um e-mail válido."                   |
      | escrevo o telefone "(82) 1234"            | Telefone           | "Informe um telefone com DDD."                |
      | escrevo a senha "abc123"                  | Senha              | "A senha precisa ter pelo menos 8 caracteres." |
      | escrevo uma confirmação diferente da senha | Confirmar senha    | "As senhas não conferem."                     |
      | desmarco o aceite dos termos              | aceite dos termos  | "Aceite os termos para criar sua conta."      |

  Esquema do Cenário: Entrar e "Manter-me conectado"
    Dado uma conta confirmada com o e-mail "ana@exemplo.com"
    Quando entro com o e-mail e a senha corretos e "Manter-me conectado" <estado>
    Então vou para a página de onde vim, ou para a home
    E depois de fechar e abrir o navegador <resultado>

    Exemplos:
      | estado     | resultado                       |
      | marcado    | continuo na conta               |
      | desmarcado | preciso entrar de novo          |

  Cenário: Senha errada não revela qual dado está errado
    Dado uma conta confirmada com o e-mail "ana@exemplo.com"
    Quando tento entrar com esse e-mail e uma senha errada
    Então vejo "E-mail ou senha inválidos"
    E ao tentar com um e-mail sem conta vejo a mesma mensagem

  Cenário: E-mail ainda não confirmado
    Dado uma conta criada com o e-mail "ana@exemplo.com" e ainda não confirmada
    Quando tento entrar com o e-mail e a senha corretos
    Então não entro na conta
    E vejo o aviso de que preciso confirmar o e-mail, com a ação de reenviar o link
```

## Regras de negócio

### Criar conta (`/criar-conta`)

- **Campos do Figma**, todos obrigatórios: Nome completo, E-mail, Telefone, Senha, Confirmar senha e o aceite "Eu aceito os Termos de Uso e a Política de Privacidade".
- **Nome completo:** não pode ficar vazio; até 120 caracteres.
- **E-mail:** formato válido; comparado sem diferenciar maiúsculas e minúsculas.
- **Telefone:** brasileiro, com DDD, 10 ou 11 dígitos, com a máscara "(00) 00000-0000" do Figma.
- **Senha:** de 8 a 72 caracteres, sem exigência de tipos de caractere. O olho mostra e esconde a senha.
- **Confirmação por e-mail:** obrigatória. Sem confirmar, a conta não entra.
- **Perfil:** no primeiro acesso autenticado, a API cria o perfil do cliente com nome e telefone do cadastro. Criar o perfil é idempotente: repetir o pedido não cria outro nem muda o que existe.
- **Textos do Figma** (decisão do Diego já tomada): "Criar sua conta", "Faça parte do nosso clube e viva experiências exclusivas!", os rótulos e placeholders dos campos ("Digite seu nome completo", "Digite seu e-mail", "(00) 00000-0000", "Digite sua senha", "Confirme sua senha"), "Eu aceito os Termos de Uso e a Política de Privacidade", "Criar conta", "Já tem uma conta?" e "Entrar".
- **Texto do card:** "Este e-mail já tem conta. Entrar?". Isso revela que o e-mail tem conta; o card aceita esse risco no cadastro, e o login continua sem revelar.

> [!todo] Preencher: para onde apontam "Termos de Uso" e "Política de Privacidade". As páginas são do LB-22 (MVP+). Ver pergunta ao Diego.

### Entrar (`/entrar`)

- Campos E-mail e Senha, "Manter-me conectado", "Esqueci minha senha" (leva à [[recuperacao-senha]]), botão "Entrar" e o link "Criar conta". Mesmo visual de "Criar sua conta" ([[identidade-visual]]).
- **"Manter-me conectado":** começa com o valor vindo da [[boas-vindas]], ou marcado quando a pessoa chega por outro caminho. Marcado: a sessão continua depois de fechar o navegador, por até 30 dias sem uso. Desmarcado: a sessão acaba ao fechar o navegador.
- **Depois de entrar:** volta à página de onde a pessoa veio (só endereços do próprio site), ou à home.
- **Erro de credencial:** sempre "E-mail ou senha inválidos", exista ou não a conta.
- **Tentativas:** os limites de tentativa do Supabase Auth ficam ligados, na configuração versionada do Supabase local.

### E-mails

- Modelos de confirmação em português, versionados com a configuração do Supabase local.
- No desenvolvimento e nos testes, os e-mails são lidos no visualizador de e-mails do Supabase local; nenhum e-mail sai para fora.

## Textos propostos

Aguardam aprovação do Diego. As mensagens dos campos estão no cenário "Formulário de cadastro inválido".

| Lugar | Texto proposto |
| --- | --- |
| Título da tela de entrar | "Entrar na sua conta" (mesmo estilo de "Criar sua conta") |
| Subtítulo da tela de entrar | "Que bom te ver de novo!" |
| Placeholders de entrar | "Digite seu e-mail" e "Digite sua senha" (os do Figma) |
| Link | "Esqueci minha senha" |
| Rodapé de entrar | "Ainda não tem conta?" e "Criar conta" |
| Aviso depois do cadastro | "Enviamos um link de confirmação para {e-mail}. Abra o e-mail para ativar sua conta." |
| Aviso de e-mail não confirmado | "Confirme seu e-mail para entrar. Não recebeu?" e a ação "Reenviar link" |
| Assunto do e-mail de confirmação | "Confirme sua conta na Leguelé Beer" |

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Schemas de cadastro e de entrar:** testes unitários em `packages/shared` (senha, e-mail, telefone, confirmação, aceite).
- **Criar perfil idempotente:** caso de uso testado com repositório em memória; rota testada com Supertest e banco real (primeira chamada cria, a segunda não duplica).
- **Formulários:** testes de componente com as mensagens de erro.
- **Cenários desta spec:** E2E com o Supabase local, lendo o e-mail de confirmação no visualizador de e-mails.

## Fora de escopo

- Login com Google e Facebook (LB-26, #41, MVP+).
- Recuperação de senha ([[recuperacao-senha]]).
- Proteção das rotas da API e do site ([[guards-api]]).
- Edição de perfil com nascimento e CPF (LB-29, #44).
- Sair da conta: a ação "Sair" fica na tela de perfil, que vem depois no [[roteiro-mvp]].
- Envio real de e-mails por um provedor (SMTP) e projeto Supabase na nuvem: LB-8 (#17). Criar conta num provedor de e-mail é decisão do Diego.
- 2FA.

## Decisões relacionadas

- [[ADR-001-stack]]: Supabase Auth, com a API validando o JWT.
- [[api-base]]: formato de erro e template de módulo (a conta é o primeiro módulo).
- [[boas-vindas]], [[recuperacao-senha]], [[guards-api]], [[identidade-visual]]
- [[GLOSSARY]]: Cliente, Convidado, Perfil.

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Todos os campos do Figma obrigatórios,** porque nenhum está marcado como opcional.
- **Senha de 8 a 72 caracteres,** sem regra de tipos de caractere (recomendação atual de segurança; 72 é o limite do hash do Supabase Auth).
- **Telefone com 10 ou 11 dígitos,** com DDD.
- **"Manter-me conectado":** até 30 dias sem uso quando marcado; termina ao fechar o navegador quando desmarcado.
- **Tela de entrar no visual de "Criar sua conta",** já que o Figma não tem essa tela.
- **Conta sem confirmação não entra** (o card pede confirmação por e-mail).

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #40 LB-25 | Link para esta spec; critérios: os 6 cenários; campos do Figma (inclui telefone e aceite dos termos); senha de 8 a 72; "Manter-me conectado" com 30 dias; e-mails no Supabase local; envio real (Resend) movido para #17 | O card não tem telefone, aceite dos termos nem regras de senha, e cita o Resend, que depende de conta nova |
| #17 LB-8 | Acrescentar: configurar o envio de e-mails do Supabase Auth na nuvem (provedor a decidir pelo Diego) | Saiu do LB-25 |
