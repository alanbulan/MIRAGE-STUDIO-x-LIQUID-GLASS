export const onRequestGet: PagesFunction = async ({ request }) => {
  const url = new URL(request.url).searchParams.get('url')
    ?? 'https://chatgpt.alanbulan.space/v1/models';
  try {
    const t0 = Date.now();
    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: 'Bearer wrl1314520' },
    });
    const ttfb = Date.now() - t0;
    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => { headers[k] = v; });
    return new Response(JSON.stringify({
      url,
      ttfb_ms: ttfb,
      status: res.status,
      headers,
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ url, error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
