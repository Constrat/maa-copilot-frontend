const fs = require('fs');
const path = require('path');

console.log('Starting translation merger...');

let existingTranslations = {};
try {
  if (fs.existsSync('src/i18n/translations.json')) {
    existingTranslations = JSON.parse(fs.readFileSync('src/i18n/translations.json', 'utf8'));
    console.log('Loaded existing translations.json');
  }
} catch (error) {
  console.error('Error reading existing translations:', error);
  process.exit(1);
}

let improvedTranslations = {};
try {
  if (fs.existsSync('src/i18n/fixed-translations.json')) {
    improvedTranslations = JSON.parse(fs.readFileSync('src/i18n/fixed-translations.json', 'utf8'));
    console.log('Loaded fixed-translations.json');
  } else {
    console.error('No fixed-translations.json found. Run the improved extraction script first.');
    process.exit(1);
  }
} catch (error) {
  console.error('Error reading improved translations:', error);
  process.exit(1);
}

const mergedTranslations = {};

Object.keys(existingTranslations).forEach(namespace => {
  if (!mergedTranslations[namespace]) {
    mergedTranslations[namespace] = {};
  }

  Object.keys(existingTranslations[namespace]).forEach(key => {
    const entry = existingTranslations[namespace][key];
    if (entry.en && entry.en !== "TODO: translate") {
      mergedTranslations[namespace][key] = { ...entry };
    }
  });
});

Object.keys(improvedTranslations).forEach(namespace => {
  if (!mergedTranslations[namespace]) {
    mergedTranslations[namespace] = {};
  }

  Object.keys(improvedTranslations[namespace]).forEach(key => {
    const improvedEntry = improvedTranslations[namespace][key];

    const chineseText = improvedEntry.cn;
    let manualTranslation = null;

    Object.keys(existingTranslations).forEach(ns => {
      Object.entries(existingTranslations[ns]).forEach(([k, v]) => {
        if (v.cn === chineseText && v.en !== "TODO: translate") {
          manualTranslation = v.en;
        }
      });
    });

    if (manualTranslation) {
      mergedTranslations[namespace][key] = {
        cn: chineseText,
        en: manualTranslation
      };
    }
    else if (!mergedTranslations[namespace][key]) {
      mergedTranslations[namespace][key] = { ...improvedEntry };
    }
  });
});

fs.writeFileSync('src/i18n/merged-translations.json', JSON.stringify(mergedTranslations, null, 2));

console.log('Merged translations saved to src/i18n/merged-translations.json');
