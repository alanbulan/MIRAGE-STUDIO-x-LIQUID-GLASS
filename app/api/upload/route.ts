export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const targetUrl = 'https://telegraph-image-92x.pages.dev/upload';
    
    // Transparently forward the multipart form data request body
    const res = await fetch(targetUrl, {
      method: "POST",
      body: req.body,
      headers: {
        "Content-Type": req.headers.get("content-type") || "multipart/form-data",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
        "Origin": "https://telegraph-image-92x.pages.dev",
        "Referer": "https://telegraph-image-92x.pages.dev/"
      },
      // @ts-ignore
      duplex: "half"
    });

    if (!res.ok) {
      const text = await res.text();
      console.error(`Upload error response: ${res.status} ${text}`);
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in upload API handler:", error);
    return NextResponse.json({ error: error.message || "Internal server error", stack: error.stack }, { status: 500 });
  }
}
