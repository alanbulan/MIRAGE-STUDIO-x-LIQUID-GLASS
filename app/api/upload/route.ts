import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const uploadReq = new FormData();
    uploadReq.append("file", file);

    const targetUrl = 'https://telegraph-image-92x.pages.dev/upload';
    
    const res = await fetch(targetUrl, {
      method: "POST",
      body: uploadReq,
      headers: {
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36",
        "Origin": "https://telegraph-image-92x.pages.dev",
        "Referer": "https://telegraph-image-92x.pages.dev/"
      }
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: res.status });
    }

    const resText = await res.text();
    let data;
    try {
      data = JSON.parse(resText);
    } catch {
      console.error(`Upload error: invalid JSON response: ${resText}`);
      return NextResponse.json({ error: "Upstream returned invalid JSON", body: resText }, { status: 502 });
    }
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in upload API handler:", error);
    return NextResponse.json({ error: error.message || "Internal server error", stack: error.stack }, { status: 500 });
  }
}
