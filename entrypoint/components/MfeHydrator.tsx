'use client';

import { useEffect } from 'react';

type ClientModule = { hydrate(el: HTMLElement, state: unknown): () => void };

export function MfeHydrator({
  id,
  src,
  state,
  inner,
  version,
}: {
  id: string;
  src: string;
  state: unknown;
  inner: string;
  version: number;
}) {
  useEffect(() => {
    const host = document.getElementById(id);
    if (!host) return;

    let root = host.shadowRoot;
    if (!root) {
      host.replaceChildren();
      root = host.attachShadow({ mode: 'open' });
      root.innerHTML = inner;
    } else if (host.dataset.version && host.dataset.version !== String(version)) {
      root.innerHTML = inner;
    }
    host.dataset.version = String(version);

    const container = root.querySelector<HTMLElement>('[data-mfe-root]');
    if (!container) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;

    import(src)
      .then((m: ClientModule) => {
        if (cancelled) return;
        cleanup = m.hydrate(container, state);
        host.dataset.hydrated = 'true';
      })
      .catch((e) => console.error(`[mfe] failed to load ${src}`, e));

    return () => {
      cancelled = true;
      cleanup?.();
      delete host.dataset.hydrated;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, src, version]);

  return null;
}
