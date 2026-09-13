// Cloudflare Edge Worker with KV storage for VKU Field Survey
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }

    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    // Helper: read surveys list from KV
    async function getSurveysFromKV() {
      if (!env || !env.SURVEYS_KV) return [];
      try {
        const raw = await env.SURVEYS_KV.get('surveys_index');
        return raw ? JSON.parse(raw) : [];
      } catch (err) {
        console.error('Error reading from KV:', err);
        return [];
      }
    }

    // Helper: save surveys list to KV
    async function saveSurveysToKV(list) {
      if (!env || !env.SURVEYS_KV) return;
      try {
        await env.SURVEYS_KV.put('surveys_index', JSON.stringify(list));
      } catch (err) {
        console.error('Error writing to KV:', err);
      }
    }

    // Route: /api/surveys
    if (url.pathname === '/api/surveys') {
      // GET /api/surveys - list all surveys
      if (request.method === 'GET') {
        const surveys = await getSurveysFromKV();
        return new Response(
          JSON.stringify({
            success: true,
            count: surveys.length,
            data: surveys
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      // POST /api/surveys - create/sync a survey
      if (request.method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';
          let surveyData = {};
          let photoUrl = null;

          if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            const id = formData.get('id') || 'survey-' + Date.now();
            const building = formData.get('building') || 'Khu V';
            const floor = formData.get('floor') || 'Tầng 1';
            const room = formData.get('room') || 'V.101';
            const category = formData.get('category') || 'Thiết bị CNTT / PC';
            const condition = Number(formData.get('condition')) || 3;
            const defectNotes = formData.get('defectNotes') || '';
            const inspectorName = formData.get('inspectorName') || 'Cán bộ kiểm định';
            const inspectorId = formData.get('inspectorId') || '';
            const createdAt = formData.get('createdAt') || new Date().toISOString();

            // Handle photo if present (convert Blob to base64 Data URL)
            const photoFile = formData.get('photo');
            if (photoFile && typeof photoFile === 'object' && photoFile.size > 0) {
              try {
                const arrayBuffer = await photoFile.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                  binary += String.fromCharCode(bytes[i]);
                }
                const base64 = btoa(binary);
                photoUrl = `data:${photoFile.type || 'image/jpeg'};base64,${base64}`;
              } catch (photoErr) {
                console.warn('Failed to convert photo to base64:', photoErr);
              }
            }

            surveyData = {
              id: String(id),
              building: String(building),
              floor: String(floor),
              room: String(room),
              category: String(category),
              condition,
              defectNotes: String(defectNotes),
              inspectorName: String(inspectorName),
              inspectorId: String(inspectorId),
              photoUrl,
              createdAt: String(createdAt),
              serverSyncedAt: new Date().toISOString()
            };
          } else {
            // JSON fallback
            const body = await request.json();
            surveyData = {
              ...body,
              id: body.id || 'survey-' + Date.now(),
              serverSyncedAt: new Date().toISOString()
            };
          }

          // Idempotency check & save in KV
          const existingList = await getSurveysFromKV();
          const existingIndex = existingList.findIndex(s => s.id === surveyData.id);
          if (existingIndex >= 0) {
            existingList[existingIndex] = surveyData;
          } else {
            existingList.unshift(surveyData); // Prepend new survey
          }
          await saveSurveysToKV(existingList);

          return new Response(
            JSON.stringify({
              success: true,
              id: surveyData.id,
              message: 'Survey persisted to Cloudflare KV central database',
              data: surveyData
            }),
            { status: 201, headers: corsHeaders }
          );
        } catch (err) {
          console.error('Error handling POST /api/surveys:', err);
          return new Response(
            JSON.stringify({
              success: false,
              message: 'Server error processing survey: ' + (err.message || String(err))
            }),
            { status: 500, headers: corsHeaders }
          );
        }
      }
    }

    // Route: DELETE /api/surveys/:id
    if (url.pathname.startsWith('/api/surveys/') && request.method === 'DELETE') {
      const id = url.pathname.replace('/api/surveys/', '').trim();
      if (id) {
        const list = await getSurveysFromKV();
        const updated = list.filter(s => s.id !== id);
        await saveSurveysToKV(updated);
        return new Response(
          JSON.stringify({
            success: true,
            message: `Survey ${id} deleted successfully from Cloudflare KV`
          }),
          { status: 200, headers: corsHeaders }
        );
      }
    }

    // Route: GET /api/stats
    if (url.pathname === '/api/stats' && request.method === 'GET') {
      const list = await getSurveysFromKV();
      const goodCount = list.filter(s => s.condition >= 4).length;
      const issueCount = list.filter(s => s.condition <= 3).length;
      const photoCount = list.filter(s => !!s.photoUrl).length;

      return new Response(
        JSON.stringify({
          success: true,
          total: list.length,
          good: goodCount,
          issues: issueCount,
          photos: photoCount,
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Route: GET /api/health
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'OK',
          database: env && env.SURVEYS_KV ? 'Cloudflare KV (Online)' : 'Local Memory',
          timestamp: new Date().toISOString()
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Default: Serve static assets (HTML, JS, CSS, PWA manifest, images)
    if (env && env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    return fetch(request);
  }
};
