# Sítio Imperador - Betim, MG

Landing page moderna e responsiva para o **Sítio Imperador** (divulgado publicamente como **Imperador Eventos / Espaço Imperador**), localizado em Bandeirinhas, Betim - MG.

## Destaques do Projeto

- **Dados Reais Verificados (Google & Casamentos.com.br)**:
  - **Endereço**: Alameda dos Varjões, 51 · Estância do Sereno (Bandeirinhas), Betim - MG, CEP 32657-500 (`-20.0459, -44.2793`).
  - **WhatsApp / Telefone**: `(31) 99972-8064` (`https://wa.me/5531999728064`).
  - **Instagram**: `@imperadoreventos` (`https://www.instagram.com/imperadoreventos/`).
  - **Domínio**: O espaço de Betim atua oficialmente via WhatsApp, Instagram e vitrine no Casamentos.com.br, sem domínio próprio registrado (o domínio `sitioimperador.com.br` pertence a um homônimo em Jundiaí/SP e não foi utilizado).
  - **Diferenciais Reais no Conteúdo**: Exclusividade de **1 evento por dia**, salão de festas coberto e envidraçado (400 a 500 convidados), piscina com cascata, boate ao lado da piscina, campo society, 2 dormitórios com **30 camas**, suíte reservada ao casal/debutante, cozinha equipada, churrasqueira e livre escolha de buffet.
- **Scroll Suave com Lenis (`1.3.26`) & Animações PNG no Scroll**:
  - Os cartões de benefícios em Bento Grid assimétrico e as seções editoriais contam com **5 recortes PNG fotorrealistas com transparência RGBA real (`colorType: 6`)** (`toast.png`, `gastronomy.png`, `lantern.png`, `botanical.png`, `flowers.png`).
  - A animação de flutuação, inclinação sutil por velocidade e escala reage diretamente ao callback `lenis.on('scroll')` em GPU (`translate3d`, `rotate`, `scale`), mantendo suavidade visual e respeitando `prefers-reduced-motion`.
- **Modo Claro & Escuro**: Suporte nativo a `prefers-color-scheme` e botão alternador no cabeçalho, com contraste auditado acima de 5.5:1 (WCAG AA/AAA).

## Como Executar Localmente

Requer Node.js 20 ou superior. Nenhuma instalação externa é necessária.

```sh
node scripts/serve.mjs
```

Acesse `http://127.0.0.1:4173` (ou `/__preview?width=375`, `/__preview?width=768`, `/__preview?width=1440` para validação responsiva).

Para rodar a suíte de verificação técnica, acessibilidade e segurança:

```sh
node --check dist/app.js
node scripts/check.mjs
```
