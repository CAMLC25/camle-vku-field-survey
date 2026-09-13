# Offline Lifecycle & Synchronization Flow

## 1. Survey State Machine

Every survey follows a deterministic state machine:

```mermaid
stateDiagram-v2
    [*] --> PENDING_SYNC: Survey created locally in IndexedDB
    PENDING_SYNC --> SYNCING: Connectivity restored / Sync triggered
    SYNCING --> SYNCED: HTTP 200/201 response from server
    SYNCING --> FAILED: Network error / HTTP 5xx / Timeout
    FAILED --> PENDING_SYNC: Manual Retry / Auto retry trigger
    SYNCED --> [*]: Process complete
```

---

## 2. Step-by-Step Flow: Offline Capture to Cloud Persistence

```mermaid
sequenceDiagram
    autonumber
    actor Inspector as Campus Inspector
    participant UI as React UI (Form)
    participant Cam as Camera Service
    participant IDB as IndexedDB (Dexie)
    participant Sync as Sync Engine
    participant SW as Service Worker / Net
    participant API as Express API Server

    Note over Inspector,API: Step 1: Offline Creation (No Internet)
    Inspector->>UI: Fill Building, Floor, Room, Category, Rating
    Inspector->>Cam: Take photo of defective equipment
    Cam-->>UI: Compressed Blob (Max 1280px, ~200KB)
    Inspector->>UI: Press "Save Inspection (Offline Capable)"
    UI->>IDB: Write survey with UUID, status: PENDING_SYNC
    UI->>IDB: Enqueue surveyId in syncQueue
    UI->>SW: Register Background Sync tag 'sync-surveys'
    UI-->>Inspector: Show green confirmation banner

    Note over Inspector,API: Step 2: Connectivity Restored
    SW->>Sync: Online event / 'sync-surveys' event fired
    Sync->>Sync: Check isSyncing mutex (acquire lock)
    Sync->>IDB: Query pending/failed surveys ordered by createdAt
    
    Note over Inspector,API: Step 3: Sequential Upload (Item 1)
    Sync->>IDB: Update survey status: SYNCING, syncAttempts++
    Sync->>API: POST /api/surveys (Multipart FormData + UUID + Photo Blob)
    alt Upload Succeeded
        API-->>Sync: 201 Created { success: true, id: UUID }
        Sync->>IDB: Update survey status: SYNCED
        Sync->>IDB: Remove item from syncQueue
    else Upload Failed (Network drop / Server error)
        API--xSync: Connection Aborted / 500
        Sync->>IDB: Update survey status: FAILED, save lastSyncError
        Note over Sync,IDB: Survey is NOT deleted!
    end

    Note over Inspector,API: Step 4: Advance to Next Item
    Sync->>Sync: Repeat sequentially for Item 2, 3...
    Sync->>Sync: Release mutex lock, notify UI
```

---

## 3. Synchronization Triggers & Reliability Hierarchy

To guarantee reliability across all operating environments and browsers, VKU Field Survey uses a multi-layered trigger hierarchy:

1. **Background Sync API (`sync-surveys`)**:
   - Registered when saving a survey.
   - When supported (Chrome, Edge, Android Webview), the operating system wakes up the Service Worker even if the user has navigated away or closed the tab.
2. **Capacitor Network Plugin Listener (`networkStatusChange`)**:
   - Native event fired by Android OS when cellular or Wi-Fi connectivity changes from disconnected to connected.
3. **Browser Window `online` Event**:
   - Web standard listener detecting `window.addEventListener('online', ...)`.
4. **Reactive App Startup Hook**:
   - Checks for pending items upon app launch if online.
5. **Manual "Sync Now" & Per-Item "Retry" Buttons**:
   - Provides user agency during live inspections or lab demonstrations.
