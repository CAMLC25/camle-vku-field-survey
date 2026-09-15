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

    // Default seeded users
    const SEEDED_USERS = [
      {
        id: 'usr-admin',
        email: 'admin@vku.udn.vn',
        fullName: 'Quản Trị Viên VKU',
        role: 'admin',
        createdAt: '2025-01-01T00:00:00.000Z',
        password: 'admin123'
      },
      {
        id: 'usr-inspector',
        email: 'canbo@vku.udn.vn',
        fullName: 'Lê Cảm (Cán bộ)',
        role: 'inspector',
        inspectorId: 'VKU-2025-01',
        createdAt: '2025-01-01T00:00:00.000Z',
        password: '123456'
      }
    ];

    // Helper: get users from KV
    async function getUsersFromKV() {
      if (!env || !env.SURVEYS_KV) return SEEDED_USERS;
      try {
        const raw = await env.SURVEYS_KV.get('users_index');
        if (!raw) {
          await env.SURVEYS_KV.put('users_index', JSON.stringify(SEEDED_USERS));
          return SEEDED_USERS;
        }
        return JSON.parse(raw);
      } catch (err) {
        console.error('Error reading users from KV:', err);
        return SEEDED_USERS;
      }
    }

    // Helper: save users to KV
    async function saveUsersToKV(users) {
      if (!env || !env.SURVEYS_KV) return;
      try {
        await env.SURVEYS_KV.put('users_index', JSON.stringify(users));
      } catch (err) {
        console.error('Error saving users to KV:', err);
      }
    }

    // Route: /api/surveys and /api/surveys/batch
    if (url.pathname === '/api/surveys' || url.pathname === '/api/surveys/batch') {
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

      // POST /api/surveys or /api/surveys/batch - create/sync surveys
      if (request.method === 'POST') {
        try {
          const contentType = request.headers.get('content-type') || '';

          // 1. FAST BATCH SYNC: Handles multiple surveys in a single HTTP request & single KV write
          if (contentType.includes('application/json')) {
            try {
              const body = await request.json();
              if (body && Array.isArray(body.surveys)) {
                const incomingList = body.surveys;
                const existingList = await getSurveysFromKV();
                const syncedIds = [];

                for (const item of incomingList) {
                  if (!item || !item.id) continue;
                  const surveyData = {
                    id: String(item.id),
                    building: String(item.building || 'Khu V'),
                    floor: String(item.floor || 'Tầng 1'),
                    room: String(item.room || 'V.101'),
                    category: String(item.category || 'Thiết bị CNTT / PC'),
                    condition: typeof item.condition === 'number' ? item.condition : 3,
                    defectNotes: String(item.defectNotes || ''),
                    inspectorName: String(item.inspectorName || 'Cán bộ kiểm định'),
                    inspectorId: String(item.inspectorId || ''),
                    createdByEmail: String(item.createdByEmail || ''),
                    photoUrl: item.photoUrl || null,
                    createdAt: String(item.createdAt || new Date().toISOString()),
                    serverSyncedAt: new Date().toISOString()
                  };

                  const existingIndex = existingList.findIndex((s) => s.id === surveyData.id);
                  if (existingIndex >= 0) {
                    if (!surveyData.photoUrl && existingList[existingIndex].photoUrl) {
                      surveyData.photoUrl = existingList[existingIndex].photoUrl;
                    }
                    existingList[existingIndex] = surveyData;
                  } else {
                    existingList.unshift(surveyData);
                  }
                  syncedIds.push(surveyData.id);
                }

                await saveSurveysToKV(existingList);

                return new Response(
                  JSON.stringify({
                    success: true,
                    count: syncedIds.length,
                    syncedIds,
                    message: `Đã đồng bộ thành công ${syncedIds.length} biên bản vào Cloudflare KV`
                  }),
                  { status: 200, headers: corsHeaders }
                );
              }
            } catch (jsonErr) {
              console.warn('JSON parsing error in batch upload:', jsonErr);
            }
          }

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
            const createdByEmail = formData.get('createdByEmail') || '';
            const createdAt = formData.get('createdAt') || new Date().toISOString();

            // 1. Direct photoUrl from client (pre-compressed base64, 0ms server CPU)
            const clientPhotoUrl = formData.get('photoUrl');
            if (clientPhotoUrl && typeof clientPhotoUrl === 'string' && clientPhotoUrl.startsWith('data:')) {
              photoUrl = clientPhotoUrl;
            }

            // 2. Binary file upload fallback (fast 8KB chunking)
            const photoFile = formData.get('photo');
            if (!photoUrl && photoFile && typeof photoFile === 'object' && photoFile.size > 0) {
              try {
                const arrayBuffer = await photoFile.arrayBuffer();
                const bytes = new Uint8Array(arrayBuffer);
                let binary = '';
                const chunkSize = 8192;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                  binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
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
              createdByEmail: String(createdByEmail),
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
            // Protect existing photo: If existing record has photoUrl and update does not, preserve it!
            if (!surveyData.photoUrl && existingList[existingIndex].photoUrl) {
              surveyData.photoUrl = existingList[existingIndex].photoUrl;
            }
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

    // Route: POST /api/auth/login
    if (url.pathname === '/api/auth/login' && request.method === 'POST') {
      try {
        let body = {};
        try {
          const rawText = await request.text();
          body = JSON.parse(rawText || '{}');
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, message: 'Dữ liệu JSON không hợp lệ' }),
            { status: 400, headers: corsHeaders }
          );
        }

        const { email, password } = body;
        const users = await getUsersFromKV();
        const cleanEmail = (email || '').trim().toLowerCase();
        const user = users.find(u => (u.email || '').toLowerCase() === cleanEmail);

        if (!user || user.password !== password) {
          return new Response(
            JSON.stringify({ success: false, message: 'Email hoặc mật khẩu không chính xác' }),
            { status: 401, headers: corsHeaders }
          );
        }

        const sanitized = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          inspectorId: user.inspectorId,
          createdAt: user.createdAt
        };

        return new Response(
          JSON.stringify({ success: true, user: sanitized }),
          { status: 200, headers: corsHeaders }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ success: false, message: 'Lỗi xử lý đăng nhập: ' + (e.message || String(e)) }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Route: POST /api/auth/register
    if (url.pathname === '/api/auth/register' && request.method === 'POST') {
      try {
        let newUser = {};
        try {
          const rawText = await request.text();
          newUser = JSON.parse(rawText || '{}');
        } catch (err) {
          return new Response(
            JSON.stringify({ success: false, message: 'Dữ liệu JSON không hợp lệ' }),
            { status: 400, headers: corsHeaders }
          );
        }

        const users = await getUsersFromKV();
        const cleanEmail = (newUser.email || '').trim().toLowerCase();

        if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
          return new Response(
            JSON.stringify({ success: false, message: 'Email đã được đăng ký' }),
            { status: 400, headers: corsHeaders }
          );
        }

        const toSave = {
          id: newUser.id || 'usr-' + Date.now(),
          email: cleanEmail,
          fullName: newUser.fullName || 'Người dùng VKU',
          role: newUser.role || 'inspector',
          inspectorId: newUser.inspectorId || (newUser.role === 'inspector' ? `VKU-${Math.floor(1000 + Math.random() * 9000)}` : undefined),
          createdAt: newUser.createdAt || new Date().toISOString(),
          password: newUser.password || '123456'
        };

        users.push(toSave);
        await saveUsersToKV(users);

        const sanitized = {
          id: toSave.id,
          email: toSave.email,
          fullName: toSave.fullName,
          role: toSave.role,
          inspectorId: toSave.inspectorId,
          createdAt: toSave.createdAt
        };

        return new Response(
          JSON.stringify({ success: true, user: sanitized }),
          { status: 201, headers: corsHeaders }
        );
      } catch (e) {
        return new Response(
          JSON.stringify({ success: false, message: 'Lỗi đăng ký tài khoản' }),
          { status: 500, headers: corsHeaders }
        );
      }
    }

    // Route: GET /api/users
    if (url.pathname === '/api/users' && request.method === 'GET') {
      const users = await getUsersFromKV();
      const sanitized = users.map(u => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        inspectorId: u.inspectorId,
        createdAt: u.createdAt
      }));
      return new Response(
        JSON.stringify({ success: true, count: sanitized.length, data: sanitized }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Route: DELETE /api/users/:id
    if (url.pathname.startsWith('/api/users/') && request.method === 'DELETE') {
      const id = url.pathname.replace('/api/users/', '').trim();
      if (id) {
        const users = await getUsersFromKV();
        const updated = users.filter(u => u.id !== id);
        await saveUsersToKV(updated);
        return new Response(
          JSON.stringify({ success: true, message: `User ${id} removed` }),
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
