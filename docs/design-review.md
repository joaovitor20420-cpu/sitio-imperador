# UI-Max Scorecard: 91/100

Autoavaliação editorial e técnica, não certificação externa.

| Critério | Nota | Evidência |
|---|---:|---|
| MOTION-01 | 11/12 | Entradas combinam deslocamento e opacidade com curva cubic-bezier; hero e benefícios têm intervalos de 80–90 ms. |
| MOTION-02 | 9/10 | CTA responde ao hover, fotos acompanham o scroll e PNGs decorativos têm deslocamento e rotação curtos. |
| LAYOUT-01 | 11/12 | Hero fotográfico com hierarquia assimétrica, título editorial e indicação de continuidade; seções alternam imagens, texto e respiro. |
| DEPTH-01 | 11/12 | Parallax nas fotos e objetos recortados, máscara em arco e zoom discreto na galeria dão profundidade. |
| INTERACTION-01 | 9/10 | Abas trocam texto e fotografia; lightbox navega e devolve foco; links, botões e imagens têm respostas espaciais. |
| A11Y-01 | 13/14 | HTML semântico, foco visível, diálogo nativo, navegação por teclado e fallback para redução de movimento; oito pares de cores passaram em 4,5:1. |
| PERF-01 | 10/12 | Lenis e fontes locais, fotos lazy, transforms em requestAnimationFrame e medidas de layout fora do handler de scroll; PNGs originais são maiores por preservar transparência e qualidade. |
| RESP-01 | 9/10 | Layout verificado em viewports de 375, 768 e 1440 px via iframe de QA, com checagem de overflow e inspeção visual. |
| BRAND-01 | 8/8 | Paleta creme e oliva, flores e folhagens, serifas editoriais e fotografia real conectam o visual à celebração e ao espaço. |

## Validação

- Sintaxe JavaScript validada com `node --check`.
- `scripts/check.mjs`: referências locais, IDs únicos, âncoras, imagens, contatos e contraste.
- Navegador: menu mobile abre e fecha após navegação; troca de evento atualiza imagem, texto e ARIA; galeria abre, avança e fecha com retorno de foco.
- Redução de movimento revisada no código e CSS: Lenis é destruído, parallax e entradas são desabilitados. Não houve alteração da preferência do sistema do usuário.
- Foto original de baixa resolução mantém fidelidade ao espaço; não foi substituída por um local fictício.

## Escolhas deliberadas

Sem WebGL ou cursor customizado: o pedido prioriza suavidade e baixo cansaço visual. Lenis, CSS e IntersectionObserver atendem a esse objetivo com menos processamento. Não há seções que prendam o scroll, vídeo automático ou movimentos amplos. O visual mantém acesso a todo o conteúdo quando JavaScript está indisponível.
