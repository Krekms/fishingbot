# 🎣 Fishing Bot - AI-анализ видео рыбалки

Приложение для анализа видео рыбалки с помощью искусственного интеллекта. Распознает виды рыб, определяет технику ловли и дает экспертные советы.

## 🚀 Возможности

- ✅ **Распознавание рыб** - определение вида, размера, поведения рыбы
- ✅ **Анализ техники** - определение метода ловли и описание техники
- ✅ **Определение снасти** - описание удилища, катушки, лески, приманки
- ✅ **Интеллектуальные советы** - рекомендации по улову и условиям
- ✅ **История анализов** - сохранение всех анализов в БД
- ✅ **Web интерфейс** - удобный интерфейс для загрузки видео
- ✅ **REST API** - доступ к функционалу через API

## 📋 Требования

- Node.js 16+
- NPM или Yarn
- OpenAI API ключ ([получить здесь](https://platform.openai.com/account/api-keys))

## 🔧 Установка

1. **Клонируй репозиторий:**
```bash
git clone https://github.com/Krekms/fishingbot.git
cd fishingbot
```

2. **Установи зависимости:**
```bash
npm install
```

3. **Создай .env файл:**
```bash
cp .env.example .env
```

4. **Добавь свой OpenAI API ключ в .env:**
```
OPENAI_API_KEY=sk-your-key-here
PORT=3000
```

5. **Запусти сервер:**
```bash
npm start
```

6. **Открой в браузере:**
```
http://localhost:3000
```

## 🌐 API Endpoints

### Загрузка и анализ видео
```bash
POST /api/analyze
Content-Type: multipart/form-data

Response:
{
  "success": true,
  "id": "uuid",
  "analysis": { ... }
}
```

### Получить анализ по ID
```bash
GET /api/analysis/:id

Response:
{
  "id": "uuid",
  "filename": "fishing.mp4",
  "analysis": { ... },
  "created_at": "2024-01-15T10:30:00Z"
}
```

### История анализов
```bash
GET /api/history

Response:
[
  {
    "id": "uuid",
    "filename": "fishing.mp4",
    "created_at": "2024-01-15T10:30:00Z"
  }
]
```

### Health check
```bash
GET /api/health

Response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## 📊 Формат анализа

Каждый анализ содержит:

```json
{
  "fish_species": [
    {
      "name": "Щука",
      "scientific_name": "Esox lucius",
      "confidence": 0.95,
      "size_estimate": "3-4 кг",
      "behavior": "агрессивное поведение"
    }
  ],
  "fishing_technique": {
    "method": "спиннинг",
    "technique_detail": "равномерная проводка",
    "difficulty_level": "любитель",
    "effectiveness": 8
  },
  "equipment": {
    "rod": "спиннинг среднего класса",
    "reel": "безинерционная катушка",
    "line": "плетеная леска 0.3мм",
    "lure": "колебалка серебристая"
  },
  "advice": {
    "tips": ["совет 1", "совет 2"],
    "improvements": ["улучшение 1"],
    "best_conditions": "ранее утро или вечер"
  },
  "success_rate": 8,
  "summary": "Хороший улов щуки на спиннинг..."
}
```

## 🎯 Примеры использования

### Web интерфейс
Просто перетащи видео на главную страницу или нажми кнопку загрузки.

### cURL
```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "video=@fishing.mp4"
```

### JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('video', fileInput.files[0]);

const response = await fetch('/api/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result.analysis);
```

## 🔐 Безопасность

- Валидация типов файлов
- Ограничение размера файла (100MB)
- CORS включен
- Ошибки не раскрывают внутреннюю информацию

## 📁 Структура проекта

```
fishingbot/
├── server.js                 # Основной сервер
├── fishingAnalyzer.js        # Логика AI анализа
├── database.js               # Работа с БД
├── package.json              # Зависимости
├── .env.example              # Пример переменных окружения
├── public/
│   └── index.html            # Web интерфейс
├── uploads/                  # Загруженные видео
├── data/                     # SQLite БД
└── README.md                 # Этот файл
```

## 🎣 Happy Fishing!
