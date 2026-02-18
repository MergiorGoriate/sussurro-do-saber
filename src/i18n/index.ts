import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import ptTranslations from './locales/pt.json';
import enTranslations from './locales/en.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true, // Enable debug to see missing keys in console
        resources: {
            pt: { translation: ptTranslations },
            en: { translation: enTranslations }
        },
        supportedLngs: ['pt', 'en'],
        nonExplicitSupportedLngs: true, // Allows 'pt-BR' to match 'pt'
        fallbackLng: 'pt',
        interpolation: {
            escapeValue: false
        }
    });

console.log('I18n initialized with:', { pt: ptTranslations, en: enTranslations });

export default i18n;
