export const onRequest: PagesFunction = async ({ request }) => {
  const u = new URL(request.url);
  const target = u.searchParams.get('url') ?? 'https://chatgpt.alanbulan.space/v1/models';
  const method = (u.searchParams.get('method') ?? 'GET').toUpperCase();
  try {
    const init: RequestInit = {
      method,
      headers: { Authorization: 'Bearer wrl1314520' },
    };
    if (method === 'POST') {
      const body = await request.text();
      (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
      init.body = body || JSON.stringify({ model: 'gpt-image-2', prompt: 'test', n: 1, size: '1024x1024' });
    }
    const t0 = Date.now();
    const res = await fetch(target, init);
    const ttfb = Date.now() - t0;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    const bodySample = await res.text();
    return new Response(JSON.stringify({
      target,
      method,
      ttfb_ms: ttfb,
      total_ms: Date.now() - t0,
      status: res.status,
      headers,
      bodySample: bodySample.slice(0, 1200),
      bodyBytes: bodySample.length,
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ target, error: e.message, stack: e.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
