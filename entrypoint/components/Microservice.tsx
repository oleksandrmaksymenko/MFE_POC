import { loadService } from '@/lib/mfe/registry';
import { MfeHydrator } from './MfeHydrator';

const RENDER_TIMEOUT_MS = 3000;

function withTimeout<T>(p: Promise<T>, ms: number, label: string) {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`${label}: timeout ${ms}ms`)), ms)),
  ]);
}

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export async function Microservice({
  name,
  props = {},
}: {
  name: string;
  props?: Record<string, unknown>;
}) {
  const base = `/mfe/${name}`;
  const id = `mfe-${name}`;

  let inner: string;
  let hydrator: React.ReactNode = null;

  try {
    const svc = await loadService(name);
    const { html, state } = await withTimeout(svc.mod.render(props), RENDER_TIMEOUT_MS, name);

    const styles = svc.css.map((href) => `<link rel="stylesheet" href="${base}/${href}">`).join('');
    inner = `${styles}<div data-mfe-root>${html}</div>`;
    hydrator = (
      <MfeHydrator
        id={id}
        src={`${base}/${svc.clientEntry}`}
        state={state}
        inner={inner}
        version={svc.version}
      />
    );
  } catch (e) {
    console.error(`[mfe:${name}]`, e);
    const reason =
      process.env.NODE_ENV === 'production' ? 'render failed' : String((e as Error)?.message ?? e);
    inner =
      `<style>.err{font:14px system-ui;color:#b00020;border:1px dashed #b00020;padding:12px;border-radius:8px}</style>` +
      `<div class="err">Service <b>${escapeHtml(name)}</b> unavailable: ${escapeHtml(reason)}</div>`;
  }

  return (
    <>
      <div
        id={id}
        data-mfe={name}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: `<template shadowrootmode="open">${inner}</template>` }}
      />
      {hydrator}
    </>
  );
}
