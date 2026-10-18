# Sítio Imperador — Betim

Landing page em português, com fotos reais do espaço, PNGs decorativos gerados, Lenis 1.3.26, galeria acessível e contato por WhatsApp.

## Rodar localmente

Requer Node.js 20 ou superior. Nenhuma instalação de dependência é necessária.

```sh
npm run dev
```

Abra http://localhost:4173. Para conferir o layout em larguras fixas, abra `/__preview?width=375`, `/__preview?width=768` ou `/__preview?width=1440`. Esses caminhos existem apenas no servidor de desenvolvimento.

```sh
npm run check
```

## Arquivos

- `dist/index.html`: conteúdo, estrutura e links com fallback sem JavaScript.
- `dist/styles.css`: identidade visual e layouts responsivos.
- `dist/app.js`: Lenis, parallax discreto, abas, menu e lightbox.
- `dist/business.json`: dados públicos verificados para contato.
- `dist/assets/`: fotos reais e três PNGs com transparência.
- `dist/vendor/`: Lenis e fontes locais, sem CDN em tempo de execução.
- `docs/sources.md` e `docs/photo-sources.json`: fontes e origem das fotografias.
- `docs/image-prompts.md`: prompts completos de geração das imagens.
- `docs/design-review.md`: decisões de design e validação.

## Conteúdo e contatos

Nome solicitado: Sítio Imperador. O espaço é divulgado publicamente como Imperador Eventos / Espaço Imperador, em Bandeirinhas, Betim.

WhatsApp: **(31) 99972-8064**. Instagram: **@imperadoreventos**. Nenhum domínio próprio foi confirmado para o espaço de Betim. O domínio `sitioimperador.com.br` pertence a um homônimo em outra cidade e não foi utilizado.

Textos comerciais foram redigidos a partir dos fatos públicos, sem copiar descrições extensas. Preços, capacidade numérica e depoimentos não foram inventados. Flores, folhas e taças geradas são elementos decorativos; as fotos dos ambientes são reais.

## Publicação

O conteúdo estático pronto está em `dist/`. A identidade do Site privado fica em `.openai/hosting.json`. O site não coleta formulários nem envia mensagens automaticamente: os botões abrem os canais de contato.
