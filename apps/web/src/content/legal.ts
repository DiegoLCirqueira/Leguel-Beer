import type { SecaoLegal } from "@/components/legal/legal-page";

// Data da versão dos textos legais (AAAA-MM-DD). Atualize ao mudar qualquer texto abaixo.
export const ATUALIZADO_EM = "2026-10-30";

export const TERMOS: SecaoLegal[] = [
  {
    titulo: "Sobre este site.",
    texto:
      "A Leguelé Beer é um projeto de portfólio de desenvolvimento de software. A cervejaria, os produtos, os preços e os dados da empresa são fictícios. Nenhum pedido é entregue e nenhum valor é cobrado: os pagamentos usam o ambiente de teste do provedor.",
  },
  {
    titulo: "Maioridade.",
    texto:
      "O site é destinado a maiores de 18 anos. Ao confirmar a maioridade na entrada, você declara ter 18 anos ou mais.",
  },
  {
    titulo: "Conta.",
    texto:
      "Para simular uma compra é preciso criar uma conta com nome, e-mail, telefone e senha. Você é responsável pelos dados que informa e pela guarda da sua senha. Não use dados de cartão reais.",
  },
  {
    titulo: "Uso permitido.",
    texto:
      "É proibido usar o site para fins ilegais, tentar acessar contas de outras pessoas ou atrapalhar o funcionamento do serviço.",
  },
  {
    titulo: "Disponibilidade.",
    texto:
      "O site roda em planos gratuitos e pode ficar fora do ar, ser alterado ou ser desligado a qualquer momento, sem aviso.",
  },
  {
    titulo: "Mudanças nestes termos.",
    texto: "Estes termos podem mudar; a data da última atualização fica no topo da página.",
  },
];

export const PRIVACIDADE: SecaoLegal[] = [
  {
    titulo: "Quais dados coletamos.",
    texto:
      "Os que você informa ao criar a conta (nome, e-mail, telefone e senha) e, quando usar o checkout, endereço de entrega. A senha é guardada pelo serviço de autenticação apenas como hash; ninguém do projeto tem acesso a ela.",
  },
  {
    titulo: "Para que usamos.",
    texto:
      "Só para o funcionamento do site: entrar na conta, simular pedidos e enviar e-mails da conta (confirmação de cadastro e recuperação de senha).",
  },
  {
    titulo: "Com quem compartilhamos.",
    texto:
      "Com os serviços que hospedam o site, o banco de dados, a autenticação e o envio de e-mails, só na medida necessária para o site funcionar. Não vendemos nem cedemos dados a terceiros.",
  },
  {
    titulo: "Cookies.",
    texto: "Usamos cookies necessários: a confirmação de maioridade (30 dias) e a sessão da conta.",
  },
  {
    titulo: "Seus direitos.",
    texto:
      "Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir acesso, correção ou exclusão dos seus dados pelo contato do responsável, abaixo.",
  },
  {
    titulo: "Responsável e contato.",
    texto:
      "O responsável pelos dados (controlador) é Diego Lins Cirqueira, autor do projeto. Pedidos sobre os seus dados vão para diegopantanalstudio@gmail.com.",
  },
  {
    titulo: "Mudanças nesta política.",
    texto: "A data da última atualização fica no topo da página.",
  },
];

export const ENTREGAS: SecaoLegal[] = [
  {
    titulo: "Projeto de portfólio.",
    texto: "Nenhum pedido é entregue de verdade; esta página descreve como a entrega funcionaria.",
  },
  { titulo: "Área de entrega.", texto: "Só Maceió e região." },
  {
    titulo: "Frete.",
    texto:
      "Calculado pela distância até a cervejaria, com frete grátis para pedidos acima de R$ 150.",
  },
  { titulo: "Retirada.", texto: "Não há retirada no local." },
];
