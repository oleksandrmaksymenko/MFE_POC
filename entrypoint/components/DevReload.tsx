'use client';

import { useEffect } from 'react';

export function DevReload() {
  useEffect(() => {
    const es = new EventSource('/mfe-dev/events');
    es.addEventListener('rebuild', (e) => {
      console.info('[mfe] rebuilt:', (e as MessageEvent).data);
      location.reload();
    });
    return () => es.close();
  }, []);
  return null;
}
