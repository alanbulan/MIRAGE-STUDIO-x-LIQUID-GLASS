export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Upload API
      if (url.pathname === "/api/upload" && request.method === "POST") {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file) {
          return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400, headers: corsHeaders });
        }

        const uploadReq = new FormData();
        uploadReq.append("file", file);

        const res = await fetch("https://telegraph-image-92x.pages.dev/upload", {
          method: "POST",
          body: uploadReq,
          headers: {
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
            "Origin": "https://telegraph-image-92x.pages.dev",
            "Referer": "https://telegraph-image-92x.pages.dev/"
          }
        });

        const resText = await res.text();
        return new Response(resText, { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // 2. OpenAI Generation proxy
      if (url.pathname.startsWith("/api/proxy/")) {
        const apiPath = url.pathname.replace(/^\/api\/proxy\//, '');
        const targetUrl = `https://chatgpt.alanbulan.space/v1/${apiPath}`;
        
        let bodyStr = "";
        if (request.method !== "GET" && request.method !== "HEAD") {
          bodyStr = await request.text();
        }

        const headers = new Headers();
        headers.set("Content-Type", "application/json");
        headers.set("Authorization", `Bearer ${env.CUSTOM_API_KEY || "wrl1314520"}`);

        const res = await fetch(targetUrl, {
          method: request.method,
          headers: headers,
          body: bodyStr ? bodyStr : undefined,
        });

        const resText = await res.text();
        return new Response(resText, {
          status: res.status,
          headers: { ...corsHeaders, "Content-Type": res.headers.get("Content-Type") || "application/json" }
        });
      }

      // 3. Image Proxy API
      if (url.pathname === "/api/image" && request.method === "GET") {
        const targetUrl = url.searchParams.get("url");
        if (!targetUrl) return new Response("No URL", { status: 400 });
        
        const res = await fetch(targetUrl);
        const buf = await res.arrayBuffer();
        
        return new Response(buf, {
          status: res.status,
          headers: {
            ...corsHeaders,
            "Content-Type": res.headers.get("Content-Type") || "image/jpeg",
            "Cache-Control": "public, max-age=86400"
          }
        });
      }

      // Serve assets if not an API route
      return env.ASSETS.fetch(request);
      
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { status: 500, headers: corsHeaders });
    }
  }
};
