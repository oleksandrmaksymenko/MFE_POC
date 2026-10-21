import { renderToString } from 'react-dom/server';
import { App } from './App';
import { loadData } from './data';
import type { ProfileProps } from './types';

export async function render(props: ProfileProps) {
  const state = await loadData(props);
  return { html: renderToString(<App {...state} />), state };
}
