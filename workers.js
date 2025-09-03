export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    // healthcheck
    if (pathname === "/health") {
      return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
        headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
      });
    }

    // free models endpoint
    if (pathname === "/" || pathname === "/free") {
      const upstream = "https://openrouter.ai/api/v1/models";
      try {
        const r = await fetch(upstream, { headers: { "Accept": "application/json" } });
        if (!r.ok) {
          return new Response(JSON.stringify({ error: { code: r.status } }), {
            status: r.status,
            headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
          });
        }
        const j = await r.json();
        const isFree = v => v === "0" || v === 0 || v === 0.0;

        const data = (j?.data || [])
          .filter(m => isFree(m?.pricing?.prompt) || isFree(m?.pricing?.completion))
          .map(m => ({
            id: m.id,
            name: m.name,
            pricing: { prompt: m?.pricing?.prompt, completion: m?.pricing?.completion }
          }))
          .filter((m, i, a) => a.findIndex(x => x.id === m.id) === i)
          .sort((a, b) => a.name.localeCompare(b.name));

        return new Response(JSON.stringify({
          lastUpdated: new Date().toISOString(),
          count: data.length,
          data
        }), {
          headers: {
            "content-type": "application/json",
            "access-control-allow-origin": "*",
            "cache-control": "public, s-maxage=300, stale-while-revalidate=600"
          }
        });
      } catch (e) {
        return new Response(JSON.stringify({ error: { code: 502, message: String(e) } }), {
          status: 502,
          headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
        });
      }
    }

    // default 404
    return new Response(JSON.stringify({ error: { code: 404, message: "Not Found" } }), {
      status: 404,
      headers: { "content-type": "application/json", "access-control-allow-origin": "*" }
    });
  }
}
