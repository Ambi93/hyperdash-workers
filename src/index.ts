export interface Model {
  id: string;
  name: string;
  pricing: {
    prompt: string | null;
    completion: string | null;
    [key: string]: any;
  };
  [key: string]: any;
}

export interface ModelsResponse {
  lastUpdated: string;
  count: number;
  data: Model[];
}

const API_URL = "https://openrouter.ai/api/v1/models";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
  "Content-Type": "application/json",
};

export default {
  async fetch(request: Request, env: any, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/health") {
      return new Response("OK", {
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "text/plain",
        },
        status: 200,
      });
    }

    if (path === "/" || path === "/free") {
      try {
        const apiResp = await fetch(API_URL, { cf: { cacheTtl: 300 } });
        const models: Model[] = await apiResp.json();

        // Filter models with free prompt or completion
        let filtered = models.filter(
          (m) =>
            m.pricing &&
            (m.pricing.prompt === "0" || m.pricing.completion === "0")
        );

        // Dedupe by id
        const deduped = Array.from(
          new Map(filtered.map((m) => [m.id, m])).values()
        );

        // Sort by name
        deduped.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        );

        const response: ModelsResponse = {
          lastUpdated: new Date().toISOString(),
          count: deduped.length,
          data: deduped,
        };

        return new Response(JSON.stringify(response), {
          headers: CORS_HEADERS,
          status: 200,
        });
      } catch (err) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch models" }),
          {
            headers: CORS_HEADERS,
            status: 500,
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { headers: CORS_HEADERS, status: 404 }
    );
  },
};
