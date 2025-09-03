# hyperdash-workers

Cloudflare Worker API that provides filtered free models from [openrouter.ai](https://openrouter.ai).

## Endpoints

- `GET /` — List all free models
- `GET /free` — Same as `/`
- `GET /health` — Health check

All responses include:
- `lastUpdated`: ISO timestamp when response was generated
- `count`: Number of models
- `data`: Array of filtered model objects

## Filtering

Models are included if either:
- `pricing.prompt === "0"`
- OR `pricing.completion === "0"`

Results are deduped by `id`, sorted by `name`.

## Headers

- `Access-Control-Allow-Origin: *`
- `Cache-Control: s-maxage=300, stale-while-revalidate=600`

## Example Response

```json
{
  "lastUpdated": "2025-09-03T05:29:25.000Z",
  "count": 12,
  "data": [
    { "id": "...", "name": "...", "pricing": { "prompt": "0", "completion": "0" }, ... }
    // ...
  ]
}
```