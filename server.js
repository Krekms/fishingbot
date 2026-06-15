const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const fishingAnalyzer = require('./fishingAnalyzer');
const database = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer config для загрузки видео
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /video\/(mp4|mpeg|quicktime|x-msvideo|webm)/;
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Только видео файлы разрешены!'));
    }
  }
});

// Initialize database
database.init();

// Routes
app.post('/api/analyze', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Видео файл не загружен' });
    }

    const videoPath = req.file.path;
    console.log(`📹 Анализирую видео: ${req.file.originalname}`);

    // Анализируем видео
    const analysis = await fishingAnalyzer.analyzeVideo(videoPath);

    // Сохраняем результаты в БД
    const result = database.saveAnalysis({
      filename: req.file.originalname,
      filepath: videoPath,
      analysis: analysis
    });

    res.json({
      success: true,
      id: result.id,
      analysis: analysis
    });
  } catch (error) {
    console.error('❌ Ошибка анализа:', error);
    res.status(500).json({ error: error.message });
  }
});

// Получить анализ по ID
app.get('/api/analysis/:id', (req, res) => {
  try {
    const analysis = database.getAnalysis(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Анализ не найден' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// История анализов
app.get('/api/history', (req, res) => {
  try {
    const history = database.getHistory(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((error, req, res, next) => {
  console.error('🚨 Ошибка сервера:', error);
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎣 Fishing Bot запущен на http://localhost:${PORT}`);
  console.log(`📡 API доступен на http://localhost:${PORT}/api`);
});

module.exports = app;
