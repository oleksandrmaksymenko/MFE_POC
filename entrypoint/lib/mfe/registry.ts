import 'server-only';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const MFE_ROOT = process.env.MFE_ROOT ?? path.resolve(process.cwd(), '..', 'services');
const isDev = process.env.NODE_ENV !== 'production';

export type ServerModule = {
  render(props: unknown): Promise<{ html: string; state: unknown }>;
};
type Manifest = Record<string, { file: string; css?: string[]; isEntry?: boolean }>;
export type LoadedService = {
  version: number;
  mod: ServerModule;
  clientEntry: string;
  css: string[];
};

const cache = new Map<string, LoadedService>();
const NAME = /^[a-z0-9-]+$/;

export async function loadService(name: string): Promise<LoadedService> {
  if (!NAME.test(name)) throw new Error(`Invalid service name: ${name}`);

  const dist = path.join(MFE_ROOT, name, 'dist');
  const serverEntry = path.join(dist, 'server', 'server.js');
  const manifestPath = path.join(dist, 'client', '.vite', 'manifest.json');

  const version = isDev
    ? Math.max((await stat(serverEntry)).mtimeMs, (await stat(manifestPath)).mtimeMs)
    : 0;

  const hit = cache.get(name);
  if (hit && hit.version === version) return hit;

  const url = pathToFileURL(serverEntry).href + (isDev ? `?v=${version}` : '');
  const mod: ServerModule = await import(url);

  const manifest: Manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const entry = Object.values(manifest).find((c) => c.isEntry);
  if (!entry) throw new Error(`No entry in manifest of ${name}`);

  const loaded: LoadedService = { version, mod, clientEntry: entry.file, css: entry.css ?? [] };
  cache.set(name, loaded);
  return loaded;
}
