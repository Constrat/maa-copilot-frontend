import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

import translations from './translations.json'

// Flatten the nested translation structure to work with keys like "Links.首页"
const flattenTranslations = (obj, lang) => {
  const result = {}

  const flatten = (current, prefix = '') => {
    Object.entries(current).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key

      if (
        value &&
        typeof value === 'object' &&
        'cn' in value &&
        'en' in value
      ) {
        // This is a translation entry, use it directly
        result[newKey] = value[lang]
      } else if (value && typeof value === 'object') {
        // Continue flattening
        flatten(value, newKey)
      }
    })
  }

  flatten(obj)
  return result
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      cn: {
        translation: flattenTranslations(translations, 'cn'),
      },
      en: {
        translation: flattenTranslations(translations, 'en'),
      },
    },
    fallbackLng: 'cn',
    lng: localStorage.getItem('language') || 'cn',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
