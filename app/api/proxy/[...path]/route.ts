import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const BASE_URL = 'https://chatgpt.alanbulan.space/v1';

export async function POST(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  const apiPath = params.path.join('/');
  
  // Try taking custom backend key from env
  const API_KEY = process.env.CUSTOM_API_KEY || "wrl1314520";
  const url = `${BASE_URL}/${apiPath}`;
  
  try {
    const text = await req.text();
    const body = text ? JSON.parse(text) : {};
    
    const requestHeaders = new Headers();
    requestHeaders.set('Content-Type', 'application/json');
    requestHeaders.set('Authorization', `Bearer ${API_KEY}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body)
    });
    
    const contentType = response.headers.get('content-type') || '';
    const resText = await response.text();
    
    let data;
    if (contentType.includes('application/json') && resText) {
      try {
        data = JSON.parse(resText);
      } catch {
        data = resText;
      }
    } else {
      data = resText;
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error', stack: err.stack }, { status: 500 });
  }
}
