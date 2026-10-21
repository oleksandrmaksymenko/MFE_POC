import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { MFE_ROOT } from '@/lib/mfe/registry';

const TYPES: Record<string, string> = {
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.map': 'application/json',
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ service: string; path: string[] }> },
) {
  const { service, path: parts } = await params;
  if (!/^[a-z0-9-]+$/.test(service)) return new Response('Bad service', { status: 400 });

  const base = path.join(MFE_ROOT, service, 'dist', 'client');
  const file = path.join(base, ...parts);
  if (!file.startsWith(base + path.sep) || parts.includes('.vite')) {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const body = await readFile(file);
    return new Response(body, {
      headers: {
        'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
        'cache-control':
          process.env.NODE_ENV === 'production' ? 'public, max-age=31536000, immutable' : 'no-store',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
