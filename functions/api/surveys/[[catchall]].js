// Cloudflare Pages Function: catch-all proxy for /api/surveys/* (e.g. DELETE /api/surveys/:id)
const WORKER_BASE = 'https://camle-vku-field-survey.lecam.workers.dev';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = new URL(url.pathname + url.search, WORKER_BASE);

  try {
    const response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.method !== 'GET' && context.request.method !== 'HEAD' ? context.request.body : undefined
    });

    return response;
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: 'Proxy to worker failed', error: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
