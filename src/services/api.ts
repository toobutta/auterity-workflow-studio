const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5055';
const API_KEY = import.meta.env.VITE_API_KEY ?? 'dev-api-key-123';

export async function getCanonical(id: string) {
  const res = await fetch(`${API_BASE}/v1/workflows/${id}`, {
    headers: { 'x-api-key': API_KEY }
  });
  if (!res.ok) throw new Error(await res.text());
  const etag = res.headers.get('etag') ?? undefined;
  const json = await res.json();
  return { json, etag };
}

export async function importCanonical(payload: unknown) {
  const res = await fetch(`${API_BASE}/v1/workflows/import`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function exportReactFlow(payload: unknown) {
  const res = await fetch(`${API_BASE}/v1/workflows/export`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
