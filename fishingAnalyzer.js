const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const FISHING_ANALYSIS_PROMPT = `Ты - опытный эксперт по рыбалке и ихтиолог. Анализируй это видео рыбалки и предоставь детальный отчет на русском языке в JSON формате:

{
  "fish_species": [
    {
      "name": "название рыбы на русском",
      "scientific_name": "научное название",
      "confidence": 0.95,
      "size_estimate": "примерный размер",
      "behavior": "описание поведения рыбы"
    }
  ],
  "fishing_technique": {
    "method": "метод ловли (спиннинг, удочка, нахлыст и т.д.)",
    "technique_detail": "детальное описание техники",
    "difficulty_level": "сложность (новичок/любитель/профессионал)",
    "effectiveness": "оценка эффективности техники (1-10)"
  },
  "equipment": {
    "rod": "описание удилища",
    "reel": "описание катушки",
    "line": "описание лески",
    "lure": "описание приманки/наживки",
    "other": "другое оборудование"
  },
  "environment": {
    "water_type": "тип водоема (река, озеро, пруд и т.д.)",
    "weather": "погодные условия",
    "time_of_day": "время суток",
    "season": "сезон"
  },
  "advice": {
    "tips": ["совет 1", "совет 2", "совет 3"],
    "improvements": ["что можно улучшить"],
    "best_conditions": "оптимальные условия для такой рыбалки"
  },
  "success_rate": "оценка успешности видео (1-10)",
  "summary": "краткое резюме на 2-3 предложения"
}

Если на видео нет рыбалки, верни ошибку. Будь максимально точен и детален.`;

async function analyzeVideo(videoPath) {
  try {
    console.log(`🔍 Загружаю видео: ${videoPath}`);
    
    // Проверяем существование файла
    if (!fs.existsSync(videoPath)) {
      throw new Error(`Файл не найден: ${videoPath}`);
    }

    const fileStats = fs.statSync(videoPath);
    console.log(`📊 Размер видео: ${(fileStats.size / 1024 / 1024).toFixed(2)}MB`);

    // Читаем видео файл в base64
    const videoBuffer = fs.readFileSync(videoPath);
    const base64Video = videoBuffer.toString('base64');

    // Определяем тип видео по расширению
    const ext = path.extname(videoPath).toLowerCase();
    const mimeType = getMimeType(ext);

    console.log(`📹 MIME тип: ${mimeType}`);
    console.log(`🤖 Отправляю видео на анализ OpenAI Vision...`);

    // Отправляем видео на анализ
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: FISHING_ANALYSIS_PROMPT
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Video}`
              }
            }
          ]
        }
      ]
    });

    console.log(`✅ Получен ответ от OpenAI`);

    // Парсим JSON ответ
    const analysisText = response.choices[0].message.content;
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Не удалось распарсить ответ AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    console.log(`🎣 Анализ завершен!`);
    return analysis;

  } catch (error) {
    console.error('❌ Ошибка при анализе видео:', error.message);
    throw error;
  }
}

function getMimeType(extension) {
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.mpeg': 'video/mpeg',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.webm': 'video/webm'
  };
  return mimeTypes[extension] || 'video/mp4';
}

module.exports = {
  analyzeVideo
};
