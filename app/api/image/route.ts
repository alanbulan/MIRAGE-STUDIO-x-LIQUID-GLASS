import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
    
    const buffer = await res.arrayBuffer();
    
    const headers = new Headers();
    headers.set("Content-Type", res.headers.get("Content-Type") || "image/jpeg");
    headers.set("Cache-Control", "public, max-age=86400");
    // Ensure canvas can read the image data
    headers.set("Access-Control-Allow-Origin", "*");

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("Error proxying image:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
