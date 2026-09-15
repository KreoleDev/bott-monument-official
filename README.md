# Bott Monument

## Primeiro, depois do pull: migrar os dados para o SQLite local

O export e a chave estão em `handoff/` neste repositório. Depois de fazer pull
do `dev`, para o Strapi e executa a partir da raiz do projeto:

```bash
cd apps/cms
npm ci
# Backup local: escolhe e guarda uma chave própria quando o CLI pedir.
npm run strapi -- export --file ./exports/before-data-migration
# Importar o conteúdo e as imagens recebidos pelo Git.
npm run strapi -- import --file ../../handoff/bott-content.tar.gz.enc --key "$(cat ../../handoff/bott-content-key.txt)" --only content,files --exclude-content-types api::inquiry.inquiry
npm run develop
```

**Confirma a importação apenas depois do backup: substitui o conteúdo e os uploads
locais, não faz merge.** Mantém as inquiries existentes, `.env`, admins, tokens
e configuração locais. Não é necessário recriar o projeto nem trocar de SQLite.

O snapshot não inclui inquiries. O repositório é público: o export e a chave
podem ser lidos por qualquer pessoa. [Detalhes da migração](docs/LOCAL_SQLITE_HANDOFF.md).

---

Site oficial da Bott Monument: memoriais em pedra, feitos à medida.

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
conteúdo          Homepage Section, media, drafts
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

Requisitos: Node 20+, npm.

### 1. Strapi

```bash
cd apps/cms
cp .env.example .env
npm install
npm run develop
```

Admin: http://localhost:1337/admin

Na primeira corrida, cria o utilizador admin. Depois:

1. Settings → API Tokens → Create new API Token
2. Name: `web-readonly`
3. Token type: **Read-only**
4. Duration: Unlimited (local)
5. Copia o token para `apps/web/.env.local`

### 2. Next.js

```bash
cd apps/web
cp .env.example .env.local
# cola o token em STRAPI_API_TOKEN
npm install
npm run dev
```

Site: http://localhost:3000

As duas apps têm de estar a correr ao mesmo tempo. O Next consulta o Strapi
no servidor; o browser nunca fala com o CMS.

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

`NEXT_PUBLIC_` expõe o valor ao browser. Token e URL interna do CMS
nunca levam esse prefixo.

---

## Boas práticas — Strapi

### Modelo de conteúdo

- **Collection type** para listas: galeria, depoimentos, imprensa, passos do processo.
- **Single type** para o que existe uma vez: Site Settings (logo, telefone, email, SEO).
- **Homepage Section** para blocos da homepage identificados por `sectionKey`
  (`hero`, `philosophy`, `gallery`, `about`, …).

Campos estáveis (`sectionKey`, slugs, IDs) não devem ser localizados. Textos
visíveis sim. Identificador localizado parte queries e duplica chaves.

Liga media com `alternativeText` obrigatório em imagens. O Next usa esse
texto no `alt`.

### Draft & Publish

Mantém draft and publish ligado. O frontend só pede conteúdo publicado.
Preview de draft é um passo posterior (`IMPLEMENTATION_PLAN.md`), não um
atalho de agora.

### API

- GraphQL é a API do frontend. REST fica para o admin.
- Token do site: **Read-only**. Nunca um token Full access no Next.
- Limita profundidade e tamanho em `apps/cms/config/plugins.ts`.
- CORS só com origens conhecidas (`CORS_ORIGINS`). Não uses `*`.
- `PUBLIC_URL` tem de coincidir com o host real. Sem isso, URLs de media
  saem relativas e o Next não as resolve.

### Media e dados

- SQLite (`.tmp/data.db`) é só prova local. Conteúdo de equipa vai para
  Postgres partilhado.
- Uploads locais não se commitam. Em produção: S3 ou Cloudinary.
- Não versionar `.env`, `.tmp`, `build`, `.strapi`, `public/uploads`.

### O que não entra no CMS

Não cries campos para classes CSS, breakpoints, animações, HTML livre de
layout, ou “JSON de design”. Cores entram só quando o editor as muda
(fundo/texto de uma secção).

---

## Boas práticas — Next.js

### Onde corre o fetch

Todo o acesso ao Strapi corre em Server Components, `page.tsx`, ou
funções em `src/lib`. O browser não leva o token.

```ts
process.env.STRAPI_URL        // ok — só servidor
process.env.STRAPI_API_TOKEN  // ok — só servidor
process.env.NEXT_PUBLIC_*     // não uses para o CMS
```

Cliente Strapi: `apps/web/src/lib/strapi.ts`.

- Queries GraphQL com nome (`query HomepageSection`).
- Tipagem alinhada com o schema do CMS.
- `next: { revalidate: 60 }` até existir webhook de revalidação.
- Se o CMS falhar, devolve `null`. A UI usa fallback. Não derrubes a página.

### Conteúdo vs apresentação

Cada secção da homepage é um componente em `apps/web/src/components`.
A página pede dados e passa-os para o componente:

```tsx
const hero = await getHomepageSection("hero");
<Hero section={hero} />
```

O componente define o layout. O CMS define o texto, a media e as cores.

Todo o bloco precisa de fallback local (título, cor, copy) para o site
abrir mesmo com Strapi desligado.

### Media

Usa `getStrapiMediaUrl()` para prefixar URLs relativas do Strapi.
Quando o `next/image` apontar para o CMS, declara o host em
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
Work background  #181A1B
Contact blue     #2C3A46
Press cream      #F7F3ED
```

---

## Como adicionar uma secção

1. Cria e publica a entry no Strapi (`sectionKey` estável, ex. `gallery`).
2. Se forem itens de lista, usa um collection type próprio, não um campo
   JSON dentro de Homepage Section.
3. No Next, pede os dados em `page.tsx` (ou num loader em `src/lib`).
4. Renderiza num componente dedicado, com fallback.
5. Copia layout, spacing e motion de `bott-monument-design/index.html`.
6. Marca a tarefa em `IMPLEMENTATION_PLAN.md`.

## Comandos

```bash
# CMS
cd apps/cms
npm run develop          # admin + API com reload
npm run build            # verifica o Strapi
npm run start            # produção local, sem reload

# Frontend
cd apps/web
npm run dev
npm run lint
npx next build --webpack
```

## Segurança

- Não commits `.env`, `.env.local`, nem tokens.
- Token do frontend: read-only, só servidor.
- GraphQL playground desligado em produção
  (`GRAPHQL_LANDING_PAGE=false`).
- Pull do `dev` antes de começar trabalho.

## Hosting (depois)

| Peça | Destino provável |
| --- | --- |
| Next.js | Vercel |
| Strapi | Railway |
| Base de dados | Postgres (Railway, Neon ou Supabase) |
| Media | Cloudinary ou S3 |

Até lá, SQLite local chega para desenvolvimento. Não uses a base local
como fonte de verdade da equipa.
