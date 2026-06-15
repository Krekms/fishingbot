const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './data/fishing.db';

let db;

function init() {
  // Создаем папку data если её нет
  const dataDir = path.dirname(DB_PATH);
  if (!require('fs').existsSync(dataDir)) {
    require('fs').mkdirSync(dataDir, { recursive: true });
  }

  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Ошибка подключения к БД:', err);
    } else {
      console.log('✅ БД подключена');
    }
  });

  // Создаем таблицу
  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      filepath TEXT NOT NULL,
      analysis TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

function saveAnalysis(data) {
  const id = uuidv4();
  const analysisJson = JSON.stringify(data.analysis);

  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO analyses (id, filename, filepath, analysis) 
       VALUES (?, ?, ?, ?)`,
      [id, data.filename, data.filepath, analysisJson],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id });
        }
      }
    );
  });
}

function getAnalysis(id) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM analyses WHERE id = ?`,
      [id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            row.analysis = JSON.parse(row.analysis);
          }
          resolve(row);
        }
      }
    );
  });
}

function getHistory(limit = 50) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, filename, created_at FROM analyses 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [limit],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      }
    );
  });
}

module.exports = {
  init,
  saveAnalysis,
  getAnalysis,
  getHistory
};
