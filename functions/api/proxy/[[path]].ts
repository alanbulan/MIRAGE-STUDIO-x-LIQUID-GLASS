interface Env {
  CUSTOM_API_KEY?: string;
}

const BASE_URL = 'https://chatgpt.alanbulan.space/v1';

export const onRequest: PagesFunction<Env> = async ({ request, params, env }) => {
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

    const response = await fetch(url, init);
    const contentType = response.headers.get('content-type') || '';
    const resText = await response.text();
    let payload: string;
    if (contentType.includes('application/json') && resText) {
      try {
        JSON.parse(resText);
        payload = resText;
      } catch {
        payload = JSON.stringify({ raw: resText });
      }
    } else {
      payload = JSON.stringify({ raw: resText });
    }
    return new Response(payload, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
