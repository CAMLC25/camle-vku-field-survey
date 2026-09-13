import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('--- STARTING BACKEND API INTEGRATION TESTS ---');

  const BASE_URL = 'http://localhost:3001';

  // 1. Health check
  console.log('[TEST 1] Testing GET /api/health...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  if (!healthRes.ok) throw new Error('Health check failed: ' + healthRes.status);
  const healthData = await healthRes.json();
  console.log('✓ Health check passed:', healthData.status);

  // 2. Create survey (multipart)
  const testId = 'test-uuid-' + Date.now();
  console.log(`[TEST 2] Testing POST /api/surveys (New record: ${testId})...`);

  // Create a small sample image file for testing
  const dummyImagePath = path.join(__dirname, 'dummy.jpg');
  fs.writeFileSync(dummyImagePath, Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xd9]));

  const formData = new FormData();
  formData.append('id', testId);
  formData.append('building', 'Building K');
  formData.append('floor', '2nd Floor');
  formData.append('room', 'K.204');
  formData.append('category', 'Projector');
  formData.append('condition', '2');
  formData.append('defectNotes', 'Projector HDMI port broken');
  formData.append('createdAt', new Date().toISOString());
  formData.append('updatedAt', new Date().toISOString());

  const fileBlob = new Blob([fs.readFileSync(dummyImagePath)], { type: 'image/jpeg' });
  formData.append('photo', fileBlob, 'defect-test.jpg');

  const postRes = await fetch(`${BASE_URL}/api/surveys`, {
    method: 'POST',
    body: formData
  });

  if (!postRes.ok) {
    const errText = await postRes.text();
    throw new Error('Failed to create survey: ' + errText);
  }

  const postData = await postRes.json();
  console.log('✓ Survey created successfully:', postData.id, postData.message);

  // 3. Test Idempotency with same UUID
  console.log(`[TEST 3] Testing Idempotency (Submitting same UUID ${testId} again)...`);
  const postAgainRes = await fetch(`${BASE_URL}/api/surveys`, {
    method: 'POST',
    body: formData
  });
  const postAgainData = await postAgainRes.json();
  if (postAgainRes.status !== 200 || !postAgainData.message.includes('idempotent')) {
    throw new Error('Idempotency test failed! Status: ' + postAgainRes.status + ' message: ' + postAgainData.message);
  }
  console.log('✓ Idempotency passed:', postAgainData.message);

  // 4. Retrieve surveys
  console.log('[TEST 4] Testing GET /api/surveys...');
  const getRes = await fetch(`${BASE_URL}/api/surveys`);
  const getData = await getRes.json();
  const matched = getData.data.find((s) => s.id === testId);
  if (!matched) throw new Error('Survey was not found in GET /api/surveys');
  console.log('✓ GET /api/surveys passed, found survey with photoUrl:', matched.photoUrl);

  // Cleanup dummy file
  if (fs.existsSync(dummyImagePath)) {
    fs.unlinkSync(dummyImagePath);
  }

  console.log('=== ALL BACKEND API TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('API Tests Failed:', err);
  process.exit(1);
});
