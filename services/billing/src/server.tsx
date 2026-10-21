import { renderToString } from 'react-dom/server';
import { App } from './App';
import { loadData } from './data';
import type { BillingProps } from './types';

export async function render(props: BillingProps) {
  const state = await loadData(props);
  return { html: renderToString(<App {...state} />), state };
}
