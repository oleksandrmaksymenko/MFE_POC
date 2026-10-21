import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import type { BillingState } from './types';
import './styles.css';

export function hydrate(container: HTMLElement, state: BillingState) {
  const root = hydrateRoot(container, <App {...state} />, {
    onRecoverableError: (e) => console.warn('[billing] recoverable', e),
  });
  return () => root.unmount();
}
