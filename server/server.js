import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure storage directories exist
const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const publicDir = path.join(__dirname, 'public');
const dataFilePath = path.join(dataDir, 'surveys.json');
const usersFilePath = path.join(dataDir, 'users.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2), 'utf-8');
}

const DEFAULT_USERS = [
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

if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify(DEFAULT_USERS, null, 2), 'utf-8');
}

function loadUsers() {
  try {
    const raw = fs.readFileSync(usersFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_USERS;
  }
}

function saveUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving users:', err);
  }
}

// Database helper
function loadSurveys() {
  try {
    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading surveys database:', err);
    return [];
  }
}

function saveSurveys(surveys) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(surveys, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving surveys database:', err);
  }
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'photo-' + uniqueSuffix + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(publicDir));
app.use('/dashboard', express.static(publicDir));

// Healthcheck endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'VKU Field Survey Backend & Command Center',
    timestamp: new Date().toISOString()
  });
});

// GET /api/stats - aggregate metrics for dashboard
app.get('/api/stats', (_req, res) => {
  const surveys = loadSurveys();
  const total = surveys.length;
  const good = surveys.filter((s) => s.condition >= 4).length;
  const warning = surveys.filter((s) => s.condition === 3).length;
  const defective = surveys.filter((s) => s.condition <= 2).length;
  const withPhoto = surveys.filter((s) => Boolean(s.photoUrl)).length;

  const byBuilding = surveys.reduce((acc, s) => {
    const b = s.building || 'Khác';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  const byCategory = surveys.reduce((acc, s) => {
    const c = s.category || 'Chung';
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  res.json({
    success: true,
    total,
    good,
    warning,
    defective,
    withPhoto,
    byBuilding,
    byCategory,
    lastUpdated: new Date().toISOString()
  });
});

// GET /api/surveys - retrieve all synchronized surveys
app.get('/api/surveys', (_req, res) => {
  const surveys = loadSurveys();
  res.json({
    success: true,
    count: surveys.length,
    data: surveys
  });
});

// POST /api/surveys - create/sync survey with photo and UUID idempotency
app.post('/api/surveys', upload.single('photo'), (req, res) => {
  try {
    const {
      id,
      building,
      floor,
      room,
      category,
      condition,
      defectNotes,
      inspectorName,
      inspectorId,
      createdAt,
      updatedAt
    } = req.body;

    if (!id || !building || !floor || !room || !category || !condition) {
      return res.status(400).json({
        success: false,
        error: 'Missing required survey fields: id, building, floor, room, category, condition'
      });
    }

    const surveys = loadSurveys();

    // Idempotency check: UUID as unique key
    const existingIndex = surveys.findIndex((s) => s.id === id);
    if (existingIndex !== -1) {
      console.log(`[IDEMPOTENCY] Survey ${id} already synced. Returning existing record.`);
      return res.status(200).json({
        success: true,
        id,
        message: 'Survey already exists on server (idempotent)',
        data: surveys[existingIndex]
      });
    }

    // New survey record
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newRecord = {
      id,
      building: String(building),
      floor: String(floor),
      room: String(room),
      category: String(category),
      condition: Number(condition),
      defectNotes: defectNotes ? String(defectNotes) : '',
      inspectorName: inspectorName ? String(inspectorName) : 'Cán bộ chưa định danh',
      inspectorId: inspectorId ? String(inspectorId) : '',
      photoUrl,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
      serverSyncedAt: new Date().toISOString()
    };

    surveys.unshift(newRecord);
    saveSurveys(surveys);

    console.log(`[SYNC SUCCESS] Survey ${id} saved for ${building} - ${floor} - Room ${room} by ${newRecord.inspectorName}`);

    return res.status(201).json({
      success: true,
      id,
      message: 'Survey synced successfully',
      data: newRecord
    });
  } catch (error) {
    console.error('Error processing survey sync:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error while persisting survey'
    });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const users = loadUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không chính xác' });
    }

    const sanitized = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      inspectorId: user.inspectorId,
      createdAt: user.createdAt
    };

    return res.json({ success: true, user: sanitized });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  try {
    const newUser = req.body;
    const users = loadUsers();
    const cleanEmail = (newUser.email || '').trim().toLowerCase();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Email đã được đăng ký' });
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
    saveUsers(users);

    const sanitized = {
      id: toSave.id,
      email: toSave.email,
      fullName: toSave.fullName,
      role: toSave.role,
      inspectorId: toSave.inspectorId,
      createdAt: toSave.createdAt
    };

    return res.status(201).json({ success: true, user: sanitized });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// GET /api/users
app.get('/api/users', (_req, res) => {
  const users = loadUsers();
  const sanitized = users.map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    role: u.role,
    inspectorId: u.inspectorId,
    createdAt: u.createdAt
  }));
  return res.json({ success: true, count: sanitized.length, data: sanitized });
});

// DELETE /api/users/:id
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const users = loadUsers();
  const filtered = users.filter(u => u.id !== id);
  saveUsers(filtered);
  return res.json({ success: true, message: `User ${id} removed` });
});

// DELETE /api/surveys/:id - delete a survey (Admin command)
app.delete('/api/surveys/:id', (req, res) => {
  try {
    const { id } = req.params;
    let surveys = loadSurveys();
    const initialLen = surveys.length;
    const target = surveys.find((s) => s.id === id);
    
    surveys = surveys.filter((s) => s.id !== id);

    if (surveys.length === initialLen) {
      return res.status(404).json({ success: false, error: 'Survey not found' });
    }

    // Optionally delete photo file if exists
    if (target?.photoUrl) {
      const pPath = path.join(__dirname, target.photoUrl);
      if (fs.existsSync(pPath)) {
        try { fs.unlinkSync(pPath); } catch (_) {}
      }
    }

    saveSurveys(surveys);
    res.json({ success: true, message: `Survey ${id} deleted successfully` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🏛️ VKU Field Survey Server & Admin Command Center`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`📊 Admin Dashboard: http://localhost:${PORT}/`);
  console.log(`💚 Health Check:    http://localhost:${PORT}/api/health`);
  console.log(`📋 Surveys API:     http://localhost:${PORT}/api/surveys`);
  console.log(`=======================================================`);
});
