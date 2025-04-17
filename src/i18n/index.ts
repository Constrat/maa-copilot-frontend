import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import translations from './translations.json'

const transformToI18Next = (data: any, language: string) => {
  const result: any = {}

  Object.entries(data).forEach(([category, items]: [string, any]) => {
    if (!result[category]) {
      result[category] = {}
    }

    Object.entries(items).forEach(([key, values]: [string, any]) => {
      if (values[language]) {
        result[category][key] = values[language]
      }
    })
  })

  return result
}

const resources = {
  en: {
    translation: transformToI18Next(translations, 'en')
  },
  cn: {
    translation: transformToI18Next(translations, 'cn')
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: localStorage.getItem('language') || 'cn',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    }
  })

export default i18n
