interface Env {
  CUSTOM_API_KEY?: string;
}

const BASE_URL = 'https://chatgpt.alanbulan.space/v1';

export const onRequest: PagesFunction<Env> = async ({ request, params, env, waitUntil }) => {
  const method = request.method.toUpperCase();
  if (method !== 'GET' && method !== 'POST' && method !== 'OPTIONS') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  const raw = params.path;
  const apiPath = Array.isArray(raw) ? raw.join('/') : (raw ?? '');
  const API_KEY = env.CUSTOM_API_KEY || 'wrl1314520';
  const url = `${BASE_URL}/${apiPath}`;

  try {
    const init: RequestInit = {
      method,
      headers: { Authorization: `Bearer ${API_KEY}` },
    };
    if (method === 'POST') {
      const text = await request.text();
      const body = text ? JSON.parse(text) : {};
      (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }

    // Upstream image generation can take 60-180s and is buffered (uvicorn
    // returns no headers until generation completes). Cloudflare's edge HTTP
    // timeout is 100s — we'd 524 before fetch() even returns. Work around
    // this by immediately returning a streamed Response and writing keepalive
    // whitespace until the upstream resolves; JSON tolerates leading whitespace,
    // so the client's res.json()/res.text()+parse path keeps working unchanged.
    const stream = new ReadableStream({
      start(controller) {
        const enc = new TextEncoder();
        // Emit a byte synchronously so the CF edge sees us "responding"
        // immediately — this resets the edge HTTP timer before fetch().
        controller.enqueue(enc.encode(' '));
        let upstreamDone = false;

        // Heartbeat: keep dribbling whitespace every 5s so the edge keeps
        // the client connection open while upstream is still working.
        const heartbeat = (async () => {
          while (!upstreamDone) {
            await new Promise((r) => setTimeout(r, 5000));
            if (upstreamDone) break;
            try { controller.enqueue(enc.encode(' ')); } catch { return; }
          }
        })();

        // Upstream fetch runs in the background; only its real body bytes
        // (which JSON.parse on the client sees after stripping whitespace)
        // are meaningful.
        const upstream = (async () => {
          try {
            const response = await fetch(url, init);
            const text = await response.text();
            controller.enqueue(enc.encode(text));
          } catch (err: any) {
            controller.enqueue(
              enc.encode(JSON.stringify({ error: err?.message || 'Upstream fetch failed' })),
            );
          } finally {
            upstreamDone = true;
            try { controller.close(); } catch {}
          }
        })();

        // Keep the Worker alive for the duration of both tasks.
        waitUntil(Promise.all([heartbeat, upstream]));
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
