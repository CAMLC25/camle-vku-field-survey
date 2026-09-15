// Cloudflare Pages Function: proxy /api/surveys/batch to Cloudflare Worker KV backend
const WORKER_BATCH_URL = 'https://camle-vku-field-survey.lecam.workers.dev/api/surveys/batch';

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = new URL(WORKER_BATCH_URL);
  targetUrl.search = url.search;

  try {
    const response = await fetch(targetUrl.toString(), {
      method: context.request.method,
      headers: context.request.headers,
      body: context.request.method !== 'GET' && context.request.method !== 'HEAD' ? context.request.body : undefined
    });

    return response;
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: 'Proxy to worker batch failed', error: String(err) }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
