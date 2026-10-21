import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import type { ProfileState } from './types';
import './styles.css';

export function hydrate(container: HTMLElement, state: ProfileState) {
  const root = hydrateRoot(container, <App {...state} />, {
    onRecoverableError: (e) => console.warn('[profile] recoverable', e),
  });
  return () => root.unmount();
}
