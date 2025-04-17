const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Starting extraction...');

function extractTextFromJSX(line) {
  const results = [];

  const attributePattern = /(?:text|label|title|placeholder|alt|tooltip)=["']([^"']*[\u4e00-\u9fff][^"']*)["']/g;
  let match;
  while ((match = attributePattern.exec(line)) !== null) {
    if (match[1].trim()) {
      results.push(match[1].trim());
    }
  }

  const contentPattern = />([^<>]*[\u4e00-\u9fff][^<>]*)</g;
  while ((match = contentPattern.exec(line)) !== null) {
    if (match[1].trim()) {
      results.push(match[1].trim());
    }
  }

  const i18nPattern = /i18n\.t\(['"]([^'"]*[\u4e00-\u9fff][^'"]*)['"]\)/g;
  while ((match = i18nPattern.exec(line)) !== null) {
    if (match[1].trim()) {
      results.push(match[1].trim());
    }
  }

  const quotedPattern = /["']([^"']*[\u4e00-\u9fff][^"']*)["']/g;
  while ((match = quotedPattern.exec(line)) !== null) {
    if (line.includes(`text="${match[1]}"`) ||
      line.includes(`label="${match[1]}"`) ||
      line.includes(`t('${match[1]}')`)) {
      continue;
    }
    if (match[1].trim()) {
      results.push(match[1].trim());
    }
  }

  return results;
}

let existingTranslations = {};
try {
  if (fs.existsSync('src/i18n/translations.json')) {
    existingTranslations = JSON.parse(fs.readFileSync('src/i18n/translations.json', 'utf8'));
  }
} catch (error) {
  console.log('Error reading existing translations:', error);
}

const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
console.log(`Found ${files.length} files to scan`);

const translations = {};

function isComment(line, inBlockComment) {
  const trimmed = line.trim();
  return inBlockComment || trimmed.startsWith('//');
}

const createMeaningfulKey = (text) => {
  const cleaned = text
    .replace(/[^\w\s\u4e00-\u9fff]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 20);

  return cleaned || 'text_' + Math.random().toString(36).substring(2, 8);
};

files.forEach(file => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    const fileRelative = path.relative('src', file);
    const namespace = fileRelative
      .replace(/\\/g, '/')
      .replace(/\.[^/.]+$/, '');

    if (!translations[namespace]) {
      translations[namespace] = {};
    }

    let inBlockComment = false;
    let lineNum = 0;
    let textFound = 0;

    lines.forEach(line => {
      lineNum++;

      if (line.includes('/*')) inBlockComment = true;
      if (line.includes('*/')) {
        inBlockComment = false;
        return;
      }

      if (isComment(line, inBlockComment)) {
        return;
      }

      const extractedTexts = extractTextFromJSX(line);

      extractedTexts.forEach(text => {
        if (!text || text.length < 2) return;
        textFound++;

        let baseKey = createMeaningfulKey(text);
        if (!baseKey) return;

        let key = baseKey;
        let counter = 1;

        let duplicateExists = false;
        Object.entries(translations[namespace]).forEach(([existingKey, value]) => {
          if (value.cn === text) {
            duplicateExists = true;
            return;
          }
        });

        if (duplicateExists) return;

        while (translations[namespace][key]) {
          key = `${baseKey}_${counter}`;
          counter++;
        }

        let englishTranslation = "TODO: translate";

        Object.values(existingTranslations).forEach(namespace => {
          Object.values(namespace).forEach(entry => {
            if (entry.cn === text && entry.en && entry.en !== "TODO: translate") {
              englishTranslation = entry.en;
            }
          });
        });

        translations[namespace][key] = {
          cn: text,
          en: englishTranslation
        };
      });
    });

    if (textFound > 0) {
      console.log(`Found ${textFound} phrases in ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

if (!fs.existsSync('src/i18n')) {
  fs.mkdirSync('src/i18n', { recursive: true });
}

fs.writeFileSync('src/i18n/fixed-translations.json', JSON.stringify(translations, null, 2));

console.log(`Extracted translations saved to src/i18n/fixed-translations.json`);
