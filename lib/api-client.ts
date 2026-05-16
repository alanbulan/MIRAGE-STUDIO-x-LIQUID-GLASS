export const AVAILABLE_MODELS = [
  'gpt-image-2',
  'codex-gpt-image-2',
  'auto',
  'gpt-5',
  'gpt-5-1',
  'gpt-5-2',
  'gpt-5-3',
  'gpt-5-3-mini',
  'gpt-5-mini'
];

export interface GenerationRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: string;
}

export interface ParsedResult {
  images: string[];
  text: string;
}

export function parseApiResponse(raw: any, status: number): ParsedResult {
  const result: ParsedResult = { images: [], text: "" };
  if (!raw) return result;

  let textToParse = "";

  if (typeof raw === "string") {
    textToParse = raw;
  } else if (raw.error) {
    textToParse = typeof raw.error === "string" ? raw.error : (raw.error.message || JSON.stringify(raw.error));
  } else if (raw.choices && raw.choices.length > 0) {
    textToParse = raw.choices[0].message?.content || raw.choices[0].text || "";
  } else if (raw.data && Array.isArray(raw.data)) {
    // Standard image generations format
    raw.data.forEach((item: any) => {
      if (item.url) {
        result.images.push(item.url);
      } else if (item.b64_json) {
        result.images.push(`data:image/jpeg;base64,${item.b64_json}`);
      }
    });
  }

  // If text contains markdown images or valid URLs, extract them
  if (textToParse) {
    // Extract markdown images ![alt](url)
    const markdownImgRegex = /!\[.*?\]\((.*?)\)/g;
    let mdMatch;
    while ((mdMatch = markdownImgRegex.exec(textToParse)) !== null) {
      if (mdMatch[1]) result.images.push(mdMatch[1]);
    }
    
    // Remove markdown images from display text to make it cleaner
    result.text = textToParse.replace(markdownImgRegex, "").trim();

    // If no images found yet, try extracting raw URLs from text
    if (result.images.length === 0) {
      const urlRegex = /(https?:\/\/[^\s"'<>\)]+\.(?:png|jpg|jpeg|gif|webp)(?:\?[^\s]*?)?)/gi;
      let urlMatch;
      while ((urlMatch = urlRegex.exec(result.text)) !== null) {
        result.images.push(urlMatch[1]);
      }
    }
  }

  // If status is an error and we found zero images, show the raw object as text if no text is present
  if (status >= 400 && result.images.length === 0 && !result.text) {
    result.text = typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2);
  }

  // Deduplicate images
  result.images = Array.from(new Set(result.images));

  return result;
}

export const api = {
  getModels: async () => {
    try {
      const res = await fetch('/api/proxy/models');
      return await res.json();
    } catch {
      return null;
    }
  },
  
  uploadImage: async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (data && data.length > 0 && data[0].src) {
        return `https://telegraph-image-92x.pages.dev${data[0].src}`;
      }
      return null;
    } catch (e) {
      console.error("Image upload failed", e);
      return null;
    }
  },

  generateImages: async (payload: GenerationRequest): Promise<{ status: number, data: any }> => {
    const res = await fetch('/api/proxy/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Include size safely, some models ignore it, others require it
      body: JSON.stringify({ ...payload, size: "1024x1024" }),
    });
    
    let raw;
    try {
      raw = await res.json();
    } catch {
      raw = await res.text();
    }
    
    return { status: res.status, data: raw };
  }
}
