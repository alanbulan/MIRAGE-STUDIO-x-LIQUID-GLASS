export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Proxy to Telegraph image host
    const uploadReq = new FormData();
    uploadReq.append("file", file);

    const targetUrl = 'https://telegraph-image-92x.pages.dev/upload';
    
    console.log(`Proxying upload to: ${targetUrl}`);

    const res = await fetch(targetUrl, {
      method: "POST",
      body: uploadReq,
      headers: {
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
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
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
