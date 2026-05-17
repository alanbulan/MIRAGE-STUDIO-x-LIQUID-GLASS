export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const uploadReq = new FormData();
    uploadReq.append('file', file);
    const res = await fetch('https://telegraph-image-92x.pages.dev/upload', {
      method: 'POST',
      body: uploadReq,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36',
        'Origin': 'https://telegraph-image-92x.pages.dev',
        'Referer': 'https://telegraph-image-92x.pages.dev/',
      },
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Upstream error: ${res.status}` }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const resText = await res.text();
    try {
      const data = JSON.parse(resText);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      return new Response(JSON.stringify({ error: 'Upstream returned invalid JSON', body: resText }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
