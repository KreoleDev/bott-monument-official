# Bott Monument

Site oficial da Bott Monument: memoriais em pedra, feitos à medida.

## Documentos

| Ficheiro | Função |
| --- | --- |
| [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) | Ficheiro principal: modelo da homepage, o que está feito e o que falta |
| [docs/LOCAL_SQLITE_HANDOFF.md](docs/LOCAL_SQLITE_HANDOFF.md) | Copiar conteúdo entre bases locais |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Produção e verificações de lançamento |
| [apps/cms/README.md](apps/cms/README.md) | Comandos e edição no CMS |
| [apps/web/README.md](apps/web/README.md) | Comandos do site |

## Depois do pull

A homepage é **Page → Home**: Header e Hero fixos, oito blocos intermédios
reordenáveis e Footer fixo. Homepage Section já não existe no schema.

O arquivo em `handoff/` é anterior a Pages. Não o importes com este schema.
O export seguinte, e o teste numa cópia SQLite, estão por fazer:
[handoff](docs/LOCAL_SQLITE_HANDOFF.md).

Se a base local ainda tiver `homepage_sections`, faz backup antes de arrancar
o Strapi. Este repositório não inclui um script que copie essa coleção para Page.
Ao arrancar, o Strapi aplica o schema novo e remove a coleção antiga.

`migrate:header-rules` só serve para uma SQLite que já tenha regras de header.
Faz backup, preserva as cores e renomeia `magazine` para `gallery`. Não cria Page.

---

O design visual já existe. Este repositório reconstrói esse design como produto
editável: **Strapi** guarda conteúdo e media; **Next.js** guarda layout,
animação e comportamento.

- Design publicado: https://kreoledev.github.io/bott-monument/
- Design local: `bott-monument-design/`
- Checklist de tarefas: `IMPLEMENTATION_PLAN.md`

## Arquitetura

```text
navegador
    │
    ▼
apps/web          Next.js 16  ·  React 19  ·  Tailwind 4
    │             fetch no servidor  ·  GraphQL  ·  ISR
    ▼
apps/cms          Strapi 5  ·  GraphQL  ·  SQLite (local)
    │
    ▼
conteúdo          Page.content, coleções, media, drafts
```

```text
bott-monument-official/
  apps/
    web/                  frontend
    cms/                  CMS e API
  bott-monument-design/   HTML original (fonte visual)
```

Não há workspaces. Cada app tem o seu `package.json` e corre à parte.

## Princípio

| Fica no Strapi | Fica no Next.js |
| --- | --- |
| Títulos, textos, CTAs | Layout, grelha, tipografia |
| Imagens, vídeos, alt text | Animações, hover, scroll |
| Cores de secção, ordem | Componentes, rotas |
| Contactos, SEO, redes | Fallbacks quando o CMS falha |

Se um editor não precisa de mudar isso no dia a dia, não é campo no Strapi.

---

## Arranque local

Requisitos: Node 22 (como no CI), npm.

### 1. Strapi

```bash
cd apps/cms
cp .env.example .env
npm ci
npm run develop
```

Admin: http://localhost:1337/admin

Na primeira corrida, cria o utilizador admin. Depois:

1. Settings → API Tokens → Create new API Token
2. Name: `web-readonly`
3. Token type: **Read-only**
4. Duration: Unlimited (local)
5. Copia o token para `apps/web/.env.local`
6. Cria outro token **Custom**, `web-inquiries`, com apenas **Inquiry → create**.
7. Guarda esse segundo token em `STRAPI_INQUIRY_TOKEN`. Não concedas leitura, alteração ou eliminação de inquiries.

### 2. Next.js

```bash
cd apps/web
cp .env.example .env.local
# cola o token em STRAPI_API_TOKEN
npm ci
npm run dev
```

Site: http://localhost:3000

Numa instalação vazia, crie e publique Page com `slug: home`, os seus campos e
coleções, ou use um futuro snapshot validado com o mesmo schema. Os seeds não
correm automaticamente e o arquivo antigo não serve para esta instalação.

As duas apps têm de estar a correr ao mesmo tempo. O Next consulta o Strapi
no servidor; os tokens nunca chegam ao browser. Imagens e vídeos podem ser carregados
diretamente do CMS pelo browser.

### Variáveis

`apps/cms/.env`

| Variável | Função |
| --- | --- |
| `HOST` / `PORT` | Servidor Strapi (`0.0.0.0:1337`) |
| `PUBLIC_URL` | URL pública do CMS (media absoluta) |
| `CORS_ORIGINS` | Origens do Next (`http://localhost:3000`) |
| `APP_KEYS`, `JWT_SECRET`, salts | Segredos do Strapi — nunca os commits |

`apps/web/.env.local`

| Variável | Função |
| --- | --- |
| `STRAPI_URL` | URL do CMS, **sem** `NEXT_PUBLIC_` |
| `STRAPI_API_TOKEN` | Token read-only, **sem** `NEXT_PUBLIC_` |
| `STRAPI_INQUIRY_TOKEN` | Token custom com apenas `api::inquiry.inquiry.create`, só servidor |
| `PREVIEW_SECRET` / `REVALIDATION_SECRET` | Segredos partilhados com o CMS |
| `STRAPI_PREVIEW_TOKEN` | Token read-only opcional para preview |
| `MEDIA_ORIGINS` | Origens públicas adicionais para otimização de imagens |

`NEXT_PUBLIC_` expõe o valor ao browser. Token e URL interna do CMS
nunca levam esse prefixo.

---

## Boas práticas — Strapi

### Modelo de conteúdo

- **Collection types** implementados para galeria, depoimentos e imprensa. Art Process é opcional e ainda não existe.
- **Site Settings** é um single type para URL pública, links sociais e paleta ativa. Nome e logo ficam em **Page → Home → Header**; título, descrição e imagem social em **Page → Home → SEO**.
  Contactos e disponibilidade ficam em `Page → Home → Contact`, sem campos duplicados.
- **Page** tem `header`, `hero` e `footer` fixos e oito tipos de bloco em `content` (Dynamic Zone); `home` identifica a homepage.
- **Homepage Section** foi retirado; todo o conteúdo da homepage está em Page e nas coleções de itens.

### Idiomas e rotas

Todas as páginas públicas usam o locale na rota. Inglês usa `/en` e `/en/news`;
português pode usar `/pt` e `/pt/news`. `/` e `/news` detetam o idioma preferido
do browser, escolhem entre as localizações publicadas de Home e redirecionam para
a rota correspondente, com inglês como fallback. Os locales são adicionados ou
removidos em **Settings → Internationalization** no Strapi. Depois de adicionar um,
cria e publica a localização de **Page → Home** para a tornar disponível no site.

Page, Comments, Features, Gallery e Press Item estão preparados para localização.
Para lançar um idioma, traduz e publica Home e os itens selecionados nesse locale.
Queries, cache, preview, metadata, atributo `lang`, datas e validação do formulário
usam o locale da rota. O envio de Inquiry também grava o locale de origem em
`submissionLocale`.
Isto adiciona idiomas à homepage; não cria rotas para outros slugs de Page.

### Paletas de cores

**Header por secção:** cada paleta tem uma lista `headerScroll`. Adiciona uma entrada
por secção, escolhe `section` (por exemplo `gallery` ou `contact`) e define o fundo
 e texto do header em `#RRGGBB`. O editor mostra as cores/gradientes da secção nessa
paleta, incluindo alterações ainda não guardadas; campos herdados são identificados.
A primeira regra ativa para a secção tem prioridade. Sem regra correspondente, o
header usa as suas cores normais. Uma lista vazia desativa todos os overrides.
As regras ativam quando a secção cruza 35% da altura do ecrã após 80px de scroll.
Publica a paleta depois de editar.

Ao atualizar uma SQLite existente: para o Strapi, executa
`npm --prefix apps/cms run migrate:header-rules` e volta a iniciar o CMS.
O comando faz backup, preserva as regras existentes e renomeia `magazine` para
`gallery` nas regras e nos links do menu.

1. Em **Content Manager → Color Palettes**, edita **Primary** ou **Secondary**, ou duplica uma delas para criar mais paletas.
2. Expande os grupos das secções e preenche cores em `#RRGGBB`. Campos vazios mantêm as cores originais do design. Publica a paleta.
3. Em **Single Types → Site Settings → activePalette**, seleciona a paleta e publica **Site Settings**.
4. Volta ao separador do site: as cores atualizam automaticamente, sem recarregar o formulário ou a galeria. Enquanto visível, a página também verifica alterações a cada 30 segundos (5 segundos em preview).

Cada paleta tem grupos para header, hero, marquee, founder, news, featuredIn,
gallery, showroom, testimonials, contact e footer. `backgroundColor` define o fundo;
`backgroundMiddleColor` e `backgroundEndColor` criam gradientes com `gradientAngle`.
Texto, texto secundário, destaque, superfícies/cartões, bordas, botões e avatar
podem ser ajustados nos grupos em que esses elementos existem. `overlayColor`
controla a sombra por cima da fotografia do showroom, sem alterar a imagem.

**Primary** mantém o design atual. **Secondary** usa as cores da alternativa local
(fundador branco, news em gradiente navy, galeria preta e showroom navy), mantendo a estrutura,
animações e ações atuais. A seleção é global no CMS; não existe seletor de demonstração
para visitantes. Novas paletas não exigem código nem novas secções.

As cores preenchidas na paleta têm prioridade sobre `backgroundColor` e `textColor`
dos blocos de Page. Esses campos são fallback;
a ordem do corpo vem de `Page.content`. Paletas e seleção suportam
publicação e preview de drafts. Ao mudar a seleção, publica a paleta e Site Settings.
O endpoint `/api/color-palette` lê a seleção atual sem cache e respeita o cookie de
preview: visitantes recebem a versão publicada e preview recebe drafts. Se o CMS
falhar, as cores atuais permanecem. O cache de conteúdo das páginas continua a usar
webhook e revalidação de 60 segundos.

O seed local idempotente está em `apps/cms/src/seeds/color-palettes.ts`; não corre no
bootstrap normal. Noutro ambiente, importa os dados ou cria/publica as paletas no CMS.

### Secções e nomes implementados

Os nomes implementados são a referência. Mantém estes valores no CMS e no código.

| Secção | Chave do mapper / chave antiga | ID no site | Componente | Coleção de itens no Strapi |
| --- | --- | --- | --- | --- |
| Navegação | — | `#navbar` | `Header` | — |
| Hero | `hero` | `#hero` | `Hero` | — |
| Marquee | `marquee` | `#marqueeStrip` | `MarqueeStrip` | — |
| Fundador (Drew) | `founder` | `#founder` | `Founder` | — |
| News / Featured Stories | `news` | `#work` | `News` | `Press Item` |
| As Featured In | `featured-in` | `#press-clippings` | `FeaturedIn` | `Features` |
| Galeria | `gallery` | `#gallery` | `Gallery` | `Gallery` |
| Showroom / About | `showroom` | `#showroom` | `Showroom` | — |
| Depoimentos | `testimonials` | `#testimonials` | `Testimonials` | `Comments` |
| Contacto | `contact` | `#contact` | `Contact` | `Inquiries` (submissões) |
| Rodapé | `footer` | `#footer` | `Footer` | — |

`Page.content` guarda o conteúdo do corpo em componentes `pages.*` com as chaves
acima. Hero e Footer são campos fixos da Page. As coleções da última coluna guardam
os itens individuais; `Inquiries` guarda as mensagens do formulário.

Navegação: **Masterpieces → `#work`**, **Gallery → `#gallery`**,
**Inquire → `#contact`**, **About → `#showroom`**. A secção `#work` usa a chave
`news`; não existe uma secção adicional com a chave `work`. `/{locale}/news` lista as notícias.

No HTML original, `#founder` identifica o showroom. Na implementação,
`#founder` identifica a introdução de Drew e `#showroom` identifica o showroom.
Mantém os nomes da implementação. O mapa correspondente está em
`IMPLEMENTATION_PLAN.md` → Design To Product Map.

Campos estáveis (slugs, UIDs de componentes, IDs) não devem ser localizados. Textos
visíveis sim. Identificador localizado parte queries e duplica chaves.

Preencha `alternativeText` nas imagens para acessibilidade. O Next usa esse
texto no `alt`; a revisão editorial ainda está pendente.

### Draft & Publish

Mantém draft and publish ligado. Visitantes recebem conteúdo publicado; o
preview autenticado já implementado lê drafts sem cache pública e mostra um banner
com saída por POST. Configure os segredos conforme o guia de deployment.

### API

- GraphQL é a API do frontend. REST fica para o admin.
- Token de conteúdo: **Read-only**. Submissões usam um token separado **Custom**, apenas para criar inquiries. Nunca uses Full access no Next.
- Limita profundidade e tamanho em `apps/cms/config/plugins.ts`.
- CORS só com origens conhecidas (`CORS_ORIGINS`). Não uses `*`.
- `PUBLIC_URL` tem de coincidir com o host real. Sem isso, URLs de media
  usam a origem configurada. `getStrapiMediaUrl()` também resolve URLs relativas.

### Media e dados

- Cada developer pode usar SQLite local (`.tmp/data.db`). Para copiar conteúdo e
  media entre instalações, usa o [guia de transferência SQLite](docs/LOCAL_SQLITE_HANDOFF.md).
  PostgreSQL partilhado continua uma opção futura de hosting.
- Uploads locais não se commitam. Em produção: S3 ou Cloudinary.
- Não versionar `.env`, `.tmp`, `build`, `.strapi`, `public/uploads`.

### O que não entra no CMS

Não cries campos para classes CSS, breakpoints, animações, HTML livre de
layout, ou “JSON de design”. Cores entram só quando o editor as muda
(fundo/texto de uma secção).

---

## Boas práticas — Next.js

### Onde corre o fetch

O acesso de conteúdo ao Strapi corre em Server Components, `getPage` no
page-builder, ou funções em `src/lib`; as submissões passam por `/api/inquiries`. O browser não leva o token.

```ts
process.env.STRAPI_URL        // ok — só servidor
process.env.STRAPI_API_TOKEN  // ok — só servidor
process.env.NEXT_PUBLIC_*     // não uses para o CMS
```

Clientes Strapi: `src/lib/pages.ts` + `page-query.ts` para Pages, `strapi.ts` para tipos de apresentação/media, `strapi-collection.ts` para listas e `cms-cache.ts` para cache.

- Queries GraphQL com nome (`query HomePage`).
- Tipagem alinhada com o schema do CMS.
- Data Cache com revalidação de 60 segundos em produção; leituras diretas em desenvolvimento e preview.
- Configuração ausente ou erro do CMS devolve `null`/`[]`; os pedidos têm timeout.
- Uma secção sem conteúdo publicado é omitida; uma falha usa a última leitura pública válida quando disponível.

### Conteúdo vs apresentação

Cada secção da homepage é um componente em `apps/web/src/components`.
A página pede dados e passa-os para o componente:

```tsx
const page = await getPage({ preview });
<RenderPage content={page.content} />
```

O componente define o layout. O CMS define o texto, a media e as cores.

Leituras públicas completas bem-sucedidas ficam em cache. Durante falhas, o processo
reutiliza a última leitura; produção usa também o Data Cache de Next. Uma resposta
vazia válida substitui o conteúdo anterior, respeitando eliminações editoriais.
Preview nunca entra na cache pública. Sem uma leitura anterior disponível, a
página mostra indisponibilidade. Isto não substitui backups nem guarda media offline.

### Media

Usa `getStrapiMediaUrl()` para prefixar URLs relativas do Strapi.
As imagens CMS usam agora a otimização de Next Image. Os hosts vêm de `STRAPI_URL`
e `MEDIA_ORIGINS` em
`apps/web/next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: "http", hostname: "localhost", port: "1337" },
    { protocol: "https", hostname: "THE_STRAPI_HOST" },
  ],
}
```

### Componentes

- Server Component por omissão.
- `"use client"` só com estado, eventos ou APIs do browser.
- Não dupliques queries dentro de componentes de apresentação.
- Design: paleta e tipo vêm do HTML original, não de defaults do
  `create-next-app`.

### Paleta (design)

```text
Main black       #0A0A0A
Deep             #111008
Mahogany         #1E1208
Gold             #C9A050
Dim gold         #8A6B2E
Bone             #F0EDE8
Stone            #A89880
News background  #2C3A46
Contact blue     #2C3A46
Press cream      #F7F3ED
```

---

## Page Builder

Edite **Page → Home** (`slug: home`). Header, Hero e Footer são campos fixos;
os oito blocos intermédios em `content` podem ser reordenados. As listas de
News, Features, Gallery e Testimonials continuam nas suas coleções; uma seleção
vazia mostra todos os itens publicados, uma seleção preenchida limita os itens.
Preview mostra o rascunho; visitantes recebem a versão publicada. O SEO fica em Page → Home → SEO e fornece os valores padrão para o site. Paletas e cores de scroll continuam em Site Settings.

A antiga coleção Homepage Section e os comandos que a copiavam foram removidos.
O modelo, a renderização e as tarefas estão em
[IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Como adicionar uma secção

O procedimento está em [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md):
componente `pages.*`, Dynamic Zone, fragmentos GraphQL, mapper e registry.
Não adicionar `switch` em `page.tsx`. A ordem do corpo vem de `Page.content`.

## Conteúdo entre instalações

Código e schemas chegam pelo Git. A base local, os uploads de trabalho e os
backups não. Os ficheiros em `handoff/` são a exceção, mas o arquivo atual é
anterior a Pages e não deve ser importado. O procedimento do próximo export,
incluindo o que fica de fora (inquiries e contas), está em
[docs/LOCAL_SQLITE_HANDOFF.md](docs/LOCAL_SQLITE_HANDOFF.md).

## Comandos (a partir da raiz)

```bash
npm --prefix apps/cms run develop
npm --prefix apps/web run dev

npm --prefix apps/cms test
npm --prefix apps/cms run build
npm --prefix apps/web test
npm --prefix apps/web run lint
npm --prefix apps/web run typecheck
npm --prefix apps/web run build
```

Use terminais separados para os dois servidores. Mais detalhes nos READMEs de
[CMS](apps/cms/README.md) e [frontend](apps/web/README.md).

## Estado

A checklist viva está em [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).
O arquivo público de conteúdo ainda não acompanha Pages. Revisão visual,
conteúdo aprovado, plugins, hosting, media persistente e SMTP continuam abertos.

## Segurança

- Não commits `.env`, `.env.local`, nem tokens.
- Tokens só no servidor: read-only para conteúdo; create-only separado para inquiries.
- GraphQL playground desligado em produção
  (`GRAPHQL_LANDING_PAGE=false`).
- Pull do `dev` antes de começar trabalho.

## Funcionalidades adicionais implementadas

- Fontes Cormorant Garamond, Montserrat e Alex Brush com `next/font` (servidas pelo Next).
- `Site Settings` publicado localmente; logo original preservado em Page → Home → Header.
- SEO, imagem social e links sociais do rodapé provenientes do CMS; URL pública fica por preencher quando existir domínio.
- Ordenação de secções pelo CMS, menu mobile, link para saltar ao conteúdo e reveals com reduced motion.
- Galeria circular preservada, com botão adicional para lightbox, navegação anterior/seguinte e Escape.
- Preview de drafts protegido: botão Preview do Strapi, banner e saída por POST.
- Webhook de publicação para `/api/revalidate`, autenticado por header secreto.
- PostgreSQL, S3 e SMTP preparados por variáveis; migração e entrega real continuam dependentes dos serviços.
- Testes de paginação, interações e isolamento de drafts/cache. Workflow CI em `.github/workflows/checks.yml`.

Operação, variáveis completas e migração: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
A notificação de inquiries só é enviada quando explicitamente ativada/configurada;
sem email, o formulário continua a guardar a mensagem em Strapi.

## Hosting (depois)

| Peça | Destino provável |
| --- | --- |
| Next.js | Vercel |
| Strapi | Railway |
| Base de dados | Postgres (Railway, Neon ou Supabase) |
| Media | Cloudinary ou S3 |

Até lá, o desenvolvimento usa a base configurada em `apps/cms/.env`:
SQLite por omissão, ou PostgreSQL quando `DATABASE_CLIENT=postgres`.
Essa base local não é a fonte de verdade da equipa. O arquivo em `handoff/`
também ainda não o é, porque é anterior a Pages.

### Editor de Page

A extensão em `apps/cms/src/admin/app.tsx` organiza os campos na ordem do site e
fecha inicialmente os cartões fixos e SEO. A lista intermédia usa os controlos
nativos do Strapi. A configuração Vite reutiliza dois renderizadores internos
do Strapi 5.53; ao atualizar Strapi, verifique o build e a abertura/edição dos
cartões, permissões, media e relações. Não há alterações em `node_modules`.
