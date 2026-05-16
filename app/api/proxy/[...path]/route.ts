export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://chatgpt.alanbulan.space/v1';
const API_KEY = process.env.CUSTOM_API_KEY || 'wrl1314520';

export async function POST(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  const pathSegments = params.path || [];
  const apiPath = pathSegments.join('/');
  const url = `${BASE_URL}/${apiPath}`;
  
  try {
    // Safely parse body
    const text = await req.text();
    const body = text ? JSON.parse(text) : {};
    
    // Next.js Edge runtime 'fetch' requires special handling for certain headers
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

export async function GET(req: NextRequest, props: { params: Promise<{ path: string[] }> }) {
  const params = await props.params;
  const pathSegments = params.path || [];
  const apiPath = pathSegments.join('/');
  
  // Forward query params
  const { searchParams } = new URL(req.url);
  const url = `${BASE_URL}/${apiPath}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      }
    });

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    return NextResponse.json(data, { status: response.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
