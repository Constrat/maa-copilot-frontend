const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('Starting extraction with English text support...');

// Get existing translations to preserve English text
let existingTranslations = {};
try {
  if (fs.existsSync('src/i18n/translations.json')) {
    existingTranslations = JSON.parse(fs.readFileSync('src/i18n/translations.json', 'utf8'));
  }
} catch (error) {
  console.log('No existing translations found or error reading file:', error);
}

// Find Chinese text with regex - match continuous blocks
const chineseRegex = /[\u4e00-\u9fff][\u4e00-\u9fff\s:：,，.。!！?？、]+/g;

// Look for potential UI text in quotes (both Chinese and English)
const uiTextRegex = /(["'])((?:[^"'\\]|\\.)*)[\u4e00-\u9fff]+(?:[^"'\\]|\\.)*\1|["']((?:[^"'\\]|\\.)+)['"]/g;

// Get all relevant files
const files = glob.sync('src/**/*.{ts,tsx,js,jsx}');
console.log(`Found ${files.length} files to scan`);

const translations = {};

// Function to check if a line is a comment
function isComment(line, inBlockComment) {
  const trimmed = line.trim();
  return inBlockComment || trimmed.startsWith('//');
}

// Create a meaningful key from text
const createMeaningfulKey = (text) => {
  if (/[\u4e00-\u9fff]/.test(text)) {
    // For Chinese text
    const simplified = text.substring(0, 10)
      .replace(/[^\u4e00-\u9fff]/g, '') // Keep only Chinese characters for the key
      .replace(/\s+/g, '_');
    return simplified || text.substring(0, 10).replace(/\s+/g, '_');
  } else {
    // For English text, create a key based on the content
    return text.substring(0, 15)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .toLowerCase();
  }
};

// Check if text is likely UI text vs a code identifier
function isLikelyUIText(text) {
  // Exclude common non-UI patterns
  if (/^[a-z][A-Za-z]*$/.test(text)) return false; // camelCase variables
  if (/^[A-Z][A-Za-z]*$/.test(text)) return false; // PascalCase components
  if (/^[A-Z_]+$/.test(text)) return false; // CONSTANT_NAMES
  if (/^https?:\/\//.test(text)) return false; // URLs
  if (/^[\.\/]/.test(text)) return false; // paths
  if (text.length < 2) return false; // Single characters

  // Include likely UI patterns
  if (/\s/.test(text)) return true; // Has spaces (likely a phrase)
  if (/[\.\,\!\?\:\;\(\)]/.test(text)) return true; // Has punctuation

  return text.length > 3; // Longer standalone words are more likely UI
}

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

      // Handle block comment state
      if (line.includes('/*')) inBlockComment = true;
      if (line.includes('*/')) {
        inBlockComment = false;
        return;
      }

      // Skip comments
      if (isComment(line, inBlockComment)) {
        return;
      }

      // Find text in UI contexts - look for text="..." patterns and similar
      let uiMatches = [];
      let match;

      // First find all Chinese text
      while ((match = chineseRegex.exec(line)) !== null) {
        const text = match[0].trim();
        if (text) uiMatches.push(text);
      }

      // Then look for UI text patterns that might be in English
      // This regex looks for text in quotes with specific patterns
      const jsxTextPattern = /(?:text|label|title|placeholder|alt|aria-label|tooltip)=["']([^"']+)["']/g;
      while ((match = jsxTextPattern.exec(line)) !== null) {
        const text = match[1].trim();
        if (text && isLikelyUIText(text)) uiMatches.push(text);
      }

      // Also check for texts in JSX children like <Button>Text</Button>
      const jsxChildren = line.match(/>([^<]+)</g);
      if (jsxChildren) {
        jsxChildren.forEach(match => {
          const text = match.replace(/^>|<$/g, '').trim();
          if (text && isLikelyUIText(text)) uiMatches.push(text);
        });
      }

      // Process all found text
      uiMatches.forEach(text => {
        textFound++;

        // Create a key from the text
        let baseKey = createMeaningfulKey(text);
        if (!baseKey) return; // Skip empty keys

        // Make sure key is unique
        let key = baseKey;
        let counter = 1;
        while (translations[namespace][key]) {
          // Only add counter if the text is different
          if (translations[namespace][key].cn === text) {
            return; // Skip duplicates
          }
          key = `${baseKey}_${counter}`;
          counter++;
        }

        // Check if the text is Chinese or English
        const isChinese = /[\u4e00-\u9fff]/.test(text);

        // Look for existing translations first
        let existingTranslation = null;
        try {
          // Search through existing translations
          for (const ns in existingTranslations) {
            for (const k in existingTranslations[ns]) {
              if (existingTranslations[ns][k].cn === text) {
                existingTranslation = existingTranslations[ns][k];
                break;
              }
            }
            if (existingTranslation) break;
          }
        } catch (e) {
          // Ignore errors in existing translations
        }

        translations[namespace][key] = {
          cn: text,
          en: existingTranslation ? existingTranslation.en : (isChinese ? "TODO: translate" : text)
        };
      });
    });

    if (textFound > 0) {
      console.log(`Found ${textFound} UI texts in ${file}`);
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error);
  }
});

// Create output directory if it doesn't exist
if (!fs.existsSync('src/i18n')) {
  fs.mkdirSync('src/i18n', { recursive: true });
}

// Write to translations file
fs.writeFileSync('src/i18n/improved-translations.json', JSON.stringify(translations, null, 2));

console.log(`Extracted translations saved to src/i18n/improved-translations.json`);
