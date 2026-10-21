import { watch } from 'node:fs';
import { MFE_ROOT } from '@/lib/mfe/registry';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });

  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let watcher: ReturnType<typeof watch> | undefined;
  let ping: ReturnType<typeof setInterval> | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: string) =>
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${data}\n\n`));

      send('ready', 'ok');
      ping = setInterval(() => send('ping', String(Date.now())), 15000);

      watcher = watch(MFE_ROOT, { recursive: true }, (_e, file) => {
        const f = String(file ?? '').replaceAll('\\', '/');
        if (!/^[^/]+\/dist\/(server\/server\.js|client\/\.vite\/manifest\.json)$/.test(f)) return;
        clearTimeout(timer);
        timer = setTimeout(() => send('rebuild', f.split('/')[0]), 300);
      });

      req.signal.addEventListener('abort', () => {
        clearTimeout(timer);
        clearInterval(ping);
        watcher?.close();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
    },
  });
}
