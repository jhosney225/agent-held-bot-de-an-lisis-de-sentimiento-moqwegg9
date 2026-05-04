```javascript
// Bot de Análisis de Sentimiento de Texto
// Ejecutar con: node index.js

const readline = require('readline');

// Diccionarios de palabras con polaridad
const sentimentDictionary = {
  positive: [
    'excelente', 'maravilloso', 'perfecto', 'fantástico', 'increíble',
    'hermoso', 'amor', 'feliz', 'alegre', 'genial', 'awesome', 'great',
    'good', 'excellent', 'wonderful', 'amazing', 'fantastic', 'brilliant',
    'outstanding', 'superb', 'best', 'brilliant', 'delighted', 'pleased',
    'happy', 'joy', 'wonderful', 'lovely', 'nice', 'good', 'positive',
    'bien', 'bueno', 'mejor', 'perfecto', 'lindo', 'bonito', 'agradable'
  ],
  negative: [
    'terrible', 'horrible', 'malo', 'peor', 'odio', 'triste', 'molesto',
    'furioso', 'decepcionado', 'angry', 'hate', 'bad', 'terrible', 'awful',
    'horrible', 'disgusting', 'dreadful', 'pathetic', 'useless', 'waste',
    'annoyed', 'upset', 'sad', 'disappointed', 'poor', 'worst', 'ugly',
    'desagradable', 'aburrido', 'cansado', 'frustrado', 'decepción'
  ],
  intensifiers: {
    'very': 1.5,
    'really': 1.5,
    'so': 1.5,
    'extremely': 2,
    'absolutely': 2,
    'incredibly': 2,
    'deeply': 1.8,
    'truly': 1.5,
    'muy': 1.5,
    'tan': 1.5,
    'sumamente': 2,
    'extremadamente': 2,
    'realmente': 1.5,
    'totalmente': 1.8,
    'profundamente': 1.8
  },
  negations: ['no', 'not', 'never', 'neither', 'nobody', 'nothing', 'ni', 'nunca']
};

// Funciones de análisis
function tokenize(text) {
  return text.toLowerCase()
    .replace(/[.,!?;:()]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

function calculateSentiment(text) {
  const tokens = tokenize(text);
  let score = 0;
  let wordCount = 0;
  const details = {
    positiveWords: [],
    negativeWords: [],
    intensifiers: [],
    negations: []
  };

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    let wordScore = 0;
    let multiplier = 1;

    // Verificar intensificadores
    if (sentimentDictionary.intensifiers[word]) {
      multiplier = sentimentDictionary.intensifiers[word];
      details.intensifiers.push(word);
      continue;
    }

    // Verificar negaciones
    if (sentimentDictionary.negations.includes(word)) {
      details.negations.push(word);
      if (i + 1 < tokens.length) {
        multiplier = -1;
      }
      continue;
    }

    // Verificar palabras positivas
    if (sentimentDictionary.positive.includes(word)) {
      wordScore = 1;
      details.positiveWords.push(word);
    }
    // Verificar palabras negativas
    else if (sentimentDictionary.negative.includes(word)) {
      wordScore = -1;
      details.negativeWords.push(word);
    }

    if (wordScore !== 0) {
      score += wordScore * multiplier;
      wordCount++;
    }
  }

  // Normalizar score
  const normalizedScore = wordCount > 0 ? score / wordCount : 0;
  
  return {
    rawScore: score,
    normalizedScore: parseFloat(normalizedScore.toFixed(2)),
    wordCount: wordCount,
    details: details,
    sentiment: classifySentiment(normalizedScore)
  };
}

function classifySentiment(score) {
  if (score > 0.5) return 'POSITIVO';
  if (score < -0.5) return 'NEGATIVO';
  if (score > 0.1) return 'LEVEMENTE POSITIVO';
  if (score < -0.1) return 'LEVEMENTE NEGATIVO';
  return 'NEUTRAL';
}

function generateReport(text, result) {
  const separator = '═'.repeat(60);
  const report = `
${separator}
📊 REPORTE DE ANÁLISIS DE SENTIMIENTO
${separator}
📝 Texto analizado: "${text}"

🎯 SENTIMIENTO GENERAL: ${result.sentiment}
📈 Puntuación normalizada: ${result.normalizedScore} (rango: -1 a 1)
📊 Puntuación bruta: ${result.rawScore}
🔢 Palabras con sentimiento detectadas: ${result.wordCount}

📋 DETALLES DEL ANÁLISIS:
  ✅ Palabras positivas encontradas: ${result.details.positiveWords.length}
     ${result.details.positiveWords.length > 0 ? '→ ' + result.details.positiveWords.join(', ') : '(ninguna)'}
  
  ❌ Palabras negativas encontradas: ${result.details.negativeWords.length}
     ${result.details.negative