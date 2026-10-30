---
status: rascunho
modulo: conta
card-notion: https://app.notion.com/p/3fd490a7ac7d814fbeded6d8c0143a57
prioridade: P0
criado: 2026-10-29
atualizado: 2026-10-29
issues:
  - "#42 LB-27"
tags:
  - feature
---

# Recuperação de senha

> [!info] Origem
> Derivada do card do Notion **LB-27** (#42) e da tela "Recuperar senha" do Figma. Depende de [[cadastro-login]]. Os e-mails ficam no visualizador de e-mails do Supabase local, como no cadastro. O Figma não tem a tela de nova senha: ela segue o visual de "Recuperar senha".

## História de usuário

- **Como** cliente que esqueceu a senha
- **Quero** receber um link por e-mail e definir uma senha nova
- **Para** voltar a entrar na minha conta

## Cenários

```gherkin
# language: pt
Funcionalidade: Recuperação de senha

  Cenário: Pedir o link de recuperação
    Dado uma conta confirmada com o e-mail "ana@exemplo.com"
    E que estou em "Recuperar senha"
    Quando informo "ana@exemplo.com" e toco em "Enviar link"
    Então vejo o aviso genérico de envio
    E chega um e-mail em português com o link para redefinir a senha

  Cenário: E-mail sem conta recebe o mesmo aviso
    Dado que não existe conta com o e-mail "ninguem@exemplo.com"
    Quando peço a recuperação para "ninguem@exemplo.com"
    Então vejo o mesmo aviso genérico de envio
    E nenhum e-mail é enviado

  Cenário: Definir a nova senha
    Dado que pedi a recuperação e abri o link do e-mail em menos de 1 hora
    Quando defino uma nova senha válida e a confirmo
    Então entro na conta e vou para a home
    E a senha antiga deixa de funcionar
    E a nova senha funciona na tela de entrar

  Esquema do Cenário: Link que não vale mais
    Dado um link de recuperação <situação>
    Quando abro o link
    Então vejo o aviso de que o link expirou ou já foi usado
    E a ação "Pedir novo link" me leva a "Recuperar senha"

    Exemplos:
      | situação                         |
      | enviado há mais de 1 hora        |
      | já usado para trocar a senha     |
      | substituído por um pedido novo   |

  Esquema do Cenário: Nova senha inválida
    Dado que abri um link de recuperação válido
    Quando <alteração> e toco em "Salvar nova senha"
    Então vejo a mensagem <mensagem>
    E a senha não muda

    Exemplos:
      | alteração                                  | mensagem                                       |
      | escrevo a nova senha "abc123"              | "A senha precisa ter pelo menos 8 caracteres." |
      | escrevo uma confirmação diferente da senha | "As senhas não conferem."                      |
```

## Regras de negócio

- **Endereços:** `/recuperar-senha` (pedir o link) e `/nova-senha` (definir a nova senha, aberta pelo link).
- **Aviso genérico:** o mesmo para e-mail com ou sem conta; nunca revela se o e-mail está cadastrado.
- **Validade do link:** 1 hora, como diz a tela do Figma. O link vale uma única vez; um pedido novo invalida o anterior.
- **Nova senha:** mesmas regras do cadastro (8 a 72 caracteres), com confirmação ([[cadastro-login]]).
- **Depois de trocar:** a pessoa entra na conta e vai para a home; as outras sessões abertas da conta são encerradas.
- **Token já emitido (risco aceito):** encerrar as outras sessões impede que elas sejam renovadas, mas o token de acesso que elas já têm continua aceito pela API até vencer, no máximo 1 hora (validade padrão do Supabase Auth). O mesmo vale para "Sair" ([[cadastro-login]]). Revogar na hora exigiria a API consultar o Supabase a cada requisição.
- **Pedidos repetidos:** um novo pedido para o mesmo e-mail só é aceito 60 segundos depois do anterior; antes disso, o aviso genérico aparece igual e nenhum e-mail novo sai.
- **Textos do Figma** (decisão do Diego já tomada): "Recuperar senha", "Digite seu e-mail e enviaremos um link para você redefinir sua senha.", "E-mail", "Digite seu e-mail cadastrado", "Verifique sua caixa de entrada", "Enviaremos um link seguro para redefinir sua senha. Não se esqueça de checar a pasta de spam, se necessário.", "O link tem validade", "O link expira em 1 hora por questões de segurança.", "Precisa de ajuda?", "Se não receber o e-mail, entre em contato com nosso suporte.", "Enviar link" e "Voltar para o login".

- **"Nosso suporte":** texto sem link (decisão do Diego, 2026-10-29).

## Textos

Aprovados pelo Diego em 2026-10-29 (pergunta 4), que autorizou acrescentar os textos necessários; os acrescentados pelo Spec estão marcados com *.

| Lugar | Texto proposto |
| --- | --- |
| Aviso genérico de envio | "Se houver uma conta com esse e-mail, você vai receber o link em instantes." |
| Título da tela de nova senha | "Nova senha" (mesmo estilo de "Recuperar senha") |
| Campos da nova senha | "Nova senha" / "Digite a nova senha" e "Confirmar senha" / "Confirme a nova senha" |
| Botão | "Salvar nova senha" |
| Link inválido | "Este link expirou ou já foi usado." e a ação "Pedir novo link" |
| Assunto do e-mail | "Redefina sua senha da Leguelé Beer" |
| Corpo do e-mail * | "Recebemos um pedido para redefinir sua senha. O link vale por 1 hora." e o botão "Redefinir senha"; abaixo, "Se não foi você, ignore este e-mail." |
| Depois de salvar a nova senha * | "Senha alterada. Você já está na sua conta." |
| Falha de rede ou erro inesperado * | "Não foi possível concluir agora. Tente de novo em instantes." |

## Seams de teste

> [!info] Proposta, ainda não combinada com o Diego
> Tirada do plano de testes do card.

- **Schema da nova senha:** reaproveita o schema de senha do cadastro (teste unitário em `packages/shared`).
- **Formulários:** testes de componente com as mensagens.
- **Cenários desta spec:** E2E com o Supabase local, lendo o link no visualizador de e-mails; a validade de 1 hora é testada com a configuração de validade do Supabase local reduzida no ambiente de teste, sem esperar.

## Fora de escopo

- Recuperação por SMS.
- Troca de senha de dentro da conta (com a senha atual): vai com o perfil.
- Envio real de e-mails por um provedor: LB-8 (#17).

## Decisões relacionadas

- [[cadastro-login]]: regras de senha e tela de entrar.
- [[identidade-visual]]

## Decisões tomadas sem consulta

Decisões pequenas e fáceis de reverter, pela política de autonomia. Qualquer uma pode ser vetada.

- **Link de uso único** e invalidado por um pedido novo.
- **Outras sessões encerradas** depois de trocar a senha.
- **Intervalo de 60 segundos** entre pedidos para o mesmo e-mail.

## Tickets propostos

| Issue | Ajuste proposto | Motivo |
| --- | --- | --- |
| #42 LB-27 | Link para esta spec; critérios: os 5 cenários; validade de 1 hora (Figma); uso único; endereços `/recuperar-senha` e `/nova-senha` | O card não define validade, link usado nem senha inválida; os endereços do card (`/esqueci-senha`) mudam para casar com o título da tela |
