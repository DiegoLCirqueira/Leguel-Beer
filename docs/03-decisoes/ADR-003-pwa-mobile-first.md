---
status: aceito
data: 2026-10-28
notion-adr: ADR-002
fonte-notion: https://app.notion.com/p/3fd490a7ac7d8133958efb66b8def8e2
tags:
  - adr
---

# ADR-003: Site mobile-first em Next.js

> [!info] Status
> **Aceito.** Migrado do ADR-002 do Notion ("Construir como PWA mobile-first em Next.js"). Ver "Ajustes na migração".

## Contexto

Os mockups têm cara de aplicativo (tab bar, bottom sheets), mas o pedido é um **site** com foco em mobile. O catálogo precisa de SEO, os links precisam ser compartilháveis e o deploy precisa ser gratuito (ver [[visao]] e [[ADR-001-stack]]). Recrutadores devem abrir a demo direto por um link.

## Decisão

- **Next.js (App Router)** com layout **mobile-first**: base de 360–430 px, adaptada ao desktop.
- Um só código para mobile e desktop, publicado na Vercel.
- **No MVP, o produto é um site responsivo, não um app instalável.** A parte instalável fica para o Pós-MVP (ver abaixo).

## Alternativas consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **Next.js mobile-first** (escolhida) | SEO com SSR/SSG, um código para mobile e desktop, deploy grátis na Vercel, demo por link | Exige cuidado com a performance das imagens no celular |
| React Native / Expo | Experiência nativa | Sem SEO; publicação em lojas é paga e lenta; recrutador não abre por link |
| Vite SPA | Simples | SEO fraco e sem renderização no servidor |

## Consequências

- **Positivas:** SEO, compartilhamento, um só código, demo acessível por link.
- **Negativas:** cuidado extra com a performance das imagens de fundo e das garrafas da [[geladeira]] no celular.

## Pós-MVP

Ligado ao épico **E17 "Site encontrável, instalável e rápido"**, classificado como Pós-MVP em [[mvp-corte]]:

- tornar o site instalável como PWA (manifest e service worker via Serwist; card LB-107) com cache offline;
- notificações push, que no iOS só funcionam com o PWA instalado.

## Ajustes na migração

| No Notion | Aqui | Por quê |
| --- | --- | --- |
| Decisão: "site Next.js mobile-first **instalável como PWA**" | Decisão: site Next.js mobile-first; a instalação como PWA foi para "Pós-MVP" | O corte do MVP mandou o épico E17 (PWA, SEO avançado, analytics) para o Pós-MVP |
| Alternativa escolhida "Next.js + PWA (Serwist)" | "Next.js mobile-first"; Serwist citado só no Pós-MVP | Mesmo motivo |
| Consequência "notificações push limitadas no iOS" | Movida para "Pós-MVP" | Push depende do PWA instalado |
| Numerado como ADR-002 | ADR-003 | O ADR-002 do repositório é o de hospedagem ([[ADR-002-hospedagem-api]]) |
