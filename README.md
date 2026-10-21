# MFE POC: Next.js entrypoint + SSR мікросервіси в Shadow DOM

Сервер запускається **тільки** в `entrypoint` (Next.js 16, App Router).
Мікросервіси (`services/*`) не мають сервера: вони лише збирають два артефакти у watch-режимі.
Entrypoint на кожен запит імпортує server-білд сервісу з диска, рендерить HTML у
Declarative Shadow DOM, а в браузері client-білд гідрує React усередині shadow root.

```
POC/
├─ entrypoint/                    Next.js, єдиний сервер (порт 3000)
│  ├─ lib/mfe/registry.ts         import() server.js сервісу + manifest, кеш по mtime
│  ├─ components/Microservice.tsx RSC: SSR сервісу в <template shadowrootmode="open">
│  ├─ components/MfeHydrator.tsx  client: import client.js і hydrate у shadowRoot
│  ├─ components/DevReload.tsx    dev: reload сторінки після перезбірки сервісу
│  ├─ app/mfe/[service]/[...path] роздача services/<name>/dist/client/*
│  └─ app/mfe-dev/events          dev: SSE + fs.watch на services/*/dist
└─ services/
   ├─ billing/                    vite build --watch (client) + vite build --ssr --watch (server)
   └─ profile/
```

## Запуск

```bash
npm install

# dev: entrypoint `next dev` + по два вотчери на кожен сервіс
npm run dev

# prod
npm run build
npm start
```

Відкрий http://localhost:3000. Сторінки: `/`, `/billing`, `/profile`, `/?user=7`.

## Контракт сервісу

Сервіс віддає два ES-модулі:

```ts
export async function render(props): Promise<{ html: string; state: unknown }>;

export function hydrate(container: HTMLElement, state: unknown): () => void;
```

`state` з `render()` серіалізується в RSC payload і передається в `hydrate()`,
тому сервер і клієнт рендерять однакові дані.

Щоб додати сервіс: скопіюй `services/profile`, зміни `SERVICE` у `vite.config.ts`,
`name` у `package.json`, додай його в скрипти кореневого `package.json`
і використай `<Microservice name="..." props={...} />` на сторінці entrypoint.

## Що перевірено (Playwright, dev і prod)

| Перевірка | Результат |
|---|---|
| shadowRoot існує одразу після парсингу HTML, до JS | так (DSD) |
| Глобальні `h2 { color: red !important }`, `button { background: yellow !important }` | у сервіси не проходять |
| Стилі сервісів (`.card`, `h2`, `button`) | не витікають у entrypoint і один в одного |
| Тема через CSS custom properties (`--surface`, `--text`) | проходить крізь shadow boundary |
| Гідрація і кліки в обох сервісах | працюють, без hydration mismatch |
| Client-side навігація через `next/link` | shadow root створюється вручну, гідрація працює |
| Неіснуючий сервіс `missing` | fallback-блок, сторінка не падає |
| Зміна `services/billing/src/App.tsx` у dev | вотчер перезбирає, SSR бере новий білд без рестарту, браузер перезавантажується (~1 с) |

## Як це працює

1. `registry.ts` робить `import(file:///.../server.js?v=<mtime>)` з
   `webpackIgnore`/`turbopackIgnore`, щоб бандлер Next не чіпав цей імпорт.
   У dev query `?v=` змушує Node завантажити нову версію після перезбірки.
2. `Microservice.tsx` кладе `<link rel=stylesheet>` сервісу і його HTML у
   `<template shadowrootmode="open">`. Браузер перетворює це на shadow root ще при парсингу.
3. `MfeHydrator.tsx` завантажує client-білд і викликає `hydrate()` на контейнері всередині shadow root.
   При client-side навігації DSD не парситься (template вставлено через innerHTML),
   тому shadow root створюється через `attachShadow` з тієї ж SSR-розмітки.
4. Обидва Vite-білди з `codeSplitting: false`: на сервері це гарантує, що інвалідація
   по `?v=` оновлює весь код сервісу, а на клієнті Vite не інжектить CSS чанків у
   `document.head` (поза shadow root).
5. У watch-режимі `emptyOutDir: false`, щоб entrypoint не натрапив на порожній `dist`
   під час перезбірки.

## Обмеження і що робити далі

- **Кожен сервіс везе свій React** (~220 KB client, ~1.2 MB server.js). Це ціна повної ізоляції.
  Оптимізація: спільний React через import map + `external` у client-білді.
- **`renderToString` не чекає Suspense.** Якщо сервісу потрібен Suspense на сервері,
  заміни на `prerenderToNodeStream` з `react-dom/static`.
- **Server-білд виконується в процесі entrypoint.** Таймаут 3 с і try/catch є, але
  нескінченний синхронний цикл або витік пам'яті в сервісі зачепить увесь сервер.
  Для жорсткої ізоляції: `worker_threads` пул на сервіс.
- **Пам'ять у dev:** ESM-модулі не вивантажуються, кожна перезбірка лишає стару версію в
  пам'яті Node. Для dev прийнятно, у prod версія фіксована.
- **`@font-face` у shadow root** не реєструється в Chrome: шрифти оголошуй у глобальному CSS entrypoint.
- **Портали/модалки** сервісу мають рендеритись у вузол усередині shadow root, а не в `document.body`.
- **Prod-деплой:** `MFE_ROOT` (env, читається в рантаймі) вказує на volume, куди CI
  сервісів викладає `dist`. Незалежний реліз сервісу = заміна його `dist` + інвалідація кешу
  в `registry.ts` (у prod він зараз кешує назавжди; можна перейти на mtime або маніфест версій).
- У консолі після client-side навігації є warning `Found declarative shadowrootmode attribute...`:
  очікувано, його обробляє `MfeHydrator`.
