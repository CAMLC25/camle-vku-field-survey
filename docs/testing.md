# VKU Field Survey — Verification & Testing Guide

This document outlines the test methodology, step-by-step demonstration walkthrough, and test results for the VKU Field Survey application.

---

## 1. Test Matrix

| Category | Test Case | Expected Behavior | Status |
| :--- | :--- | :--- | :--- |
| **PWA Shell** | Cache-First Offline Boot | App loads and renders UI when offline with empty cache disabled | **PASS** |
| **IndexedDB** | Local Survey Persistence | Surveys saved offline appear in Dexie database with UUID & PENDING_SYNC | **PASS** |
| **IndexedDB** | Photo Blob Storage | Captured photos stored as compressed Blobs directly in IndexedDB | **PASS** |
| **Network** | Offline State Detection | UI badge updates to amber `OFFLINE MODE` within 500ms of disconnect | **PASS** |
| **Network** | Online State Detection | UI badge updates to green `ONLINE` upon reconnection | **PASS** |
| **Sync Engine**| Sequential Upload | Multiple pending surveys upload strictly one-by-one without race conditions | **PASS** |
| **Sync Engine**| Failure Resilience | Failed uploads mark survey as `FAILED` with error message; data is never lost | **PASS** |
| **Backend** | UUID Idempotency | Re-submitting identical survey UUID returns HTTP 200 without duplicate records | **PASS** |
| **Capacitor** | Native Android Project | Project generates valid Gradle project with Camera and Network permissions | **PASS** |

---

## 2. University Lab Demonstration Scenario

Follow these steps during a live evaluation or presentation:

### Phase A: PWA Installation & Offline Launch
1. Launch the app in Google Chrome: `http://localhost:5173`.
2. Observe the browser address bar displaying the install icon (`Install VKU Survey`).
3. Open Chrome DevTools (`F12`) -> **Network** tab -> Check **Offline**.
4. Reload the page (`Ctrl + R` or `F5`).
5. **Observation**: The app shell reloads instantly with full functionality from Service Worker Cache Storage.

### Phase B: Offline Survey Creation
1. While still in **Offline** mode, click **Create Inspection** (or use the center `+` button).
2. Enter inspection details:
   - Building: `Building K`
   - Floor: `2nd Floor`
   - Room: `K.204`
   - Category: `Projector`
   - Condition Rating: `2 Stars`
   - Defect Notes: `HDMI connection loose, bulb flickers occasionally`
3. Click **Take Photo or Choose File** and attach an image.
4. Click **Save Inspection (Offline Capable)**.
5. **Observation**:
   - Survey is saved locally into IndexedDB.
   - Status is marked as <span style="color:#d97706;font-weight:bold;">PENDING_SYNC</span>.
   - The survey appears in the **History** tab with its photo thumbnail.

### Phase C: Reconnection & Automatic Sync
1. Return to Chrome DevTools -> **Network** tab -> Change **Offline** back to **No throttling** (Online).
2. Ensure the backend server is running (`npm run server`).
3. **Observation**:
   - The Network Status badge dynamically transitions from `OFFLINE` to `SYNCING...` to `ALL SYNCED`.
   - The survey in the History tab turns green: <span style="color:#059669;font-weight:bold;">SYNCED</span>.
   - The server console logs: `[SYNC SUCCESS] Survey <uuid> saved for Building K - 2nd Floor - Room K.204`.

### Phase D: Idempotency & Duplicate Prevention
1. In the **History** tab, click **Sync All** or re-send the survey payload.
2. The server logs `[IDEMPOTENCY] Survey <uuid> already synced. Returning existing record.`
3. No duplicate records are created on the server.

---

## 3. Automated API Integration Tests

To run the automated integration suite:
```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Run automated test script
node scripts/test-api.js
```

### Verification Output:
```text
--- STARTING BACKEND API INTEGRATION TESTS ---
[TEST 1] Testing GET /api/health...
✓ Health check passed: ok
[TEST 2] Testing POST /api/surveys (New record: test-uuid-...)...
✓ Survey created successfully: test-uuid-... Survey synced successfully
[TEST 3] Testing Idempotency (Submitting same UUID test-uuid-... again)...
✓ Idempotency passed: Survey already exists on server (idempotent)
[TEST 4] Testing GET /api/surveys...
✓ GET /api/surveys passed, found survey with photoUrl: /uploads/photo-...jpg
=== ALL BACKEND API TESTS PASSED SUCCESSFULLY! ===
```

---

## 4. Browser Compatibility Matrix

| Feature | Chrome / Edge | Safari (iOS) | Firefox | Android WebView |
| :--- | :--- | :--- | :--- | :--- |
| **IndexedDB (Dexie)** | Full | Full | Full | Full |
| **Service Worker Cache** | Full | Full | Full | Full |
| **Background Sync API** | Full (`sync-surveys`) | Fallback (Online event) | Fallback (Online event) | Full |
| **Capacitor Camera** | Web Fallback | Web Fallback | Web Fallback | Native Android Camera |
| **Capacitor Network** | Web Fallback | Web Fallback | Web Fallback | Native Android Network |
