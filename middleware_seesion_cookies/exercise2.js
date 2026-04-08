const express = require('express');
const router = express.Router();

const translations = {
  en: {
    welcome: 'Welcome',
    language: 'Language',
    selectLanguage: 'Select your preferred language',
    english: 'English',
    spanish: 'Spanish',
    french: 'French',
    german: 'German',
    japanese: 'Japanese',
    currentLanguage: 'Current Language',
    greeting: 'Hello! Your language preference has been saved.',
    description: 'This page demonstrates language switching using cookies that persist across sessions.'
  },
  es: {
    welcome: 'Bienvenido',
    language: 'Idioma',
    selectLanguage: 'Selecciona tu idioma preferido',
    english: 'Inglés',
    spanish: 'Español',
    french: 'Francés',
    german: 'Alemán',
    japanese: 'Japonés',
    currentLanguage: 'Idioma Actual',
    greeting: '¡Hola! Tu preferencia de idioma ha sido guardada.',
    description: 'Esta página demuestra el cambio de idioma usando cookies que persisten entre sesiones.'
  },
  fr: {
    welcome: 'Bienvenue',
    language: 'Langue',
    selectLanguage: 'Sélectionnez votre langue préférée',
    english: 'Anglais',
    spanish: 'Espagnol',
    french: 'Français',
    german: 'Allemand',
    japanese: 'Japonais',
    currentLanguage: 'Langue Actuelle',
    greeting: 'Bonjour! Votre préférence de langue a été sauvegardée.',
    description: 'Cette page démontre le changement de langue à l\'aide de cookies qui persistent entre les sessions.'
  },
  de: {
    welcome: 'Willkommen',
    language: 'Sprache',
    selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache',
    english: 'Englisch',
    spanish: 'Spanisch',
    french: 'Französisch',
    german: 'Deutsch',
    japanese: 'Japanisch',
    currentLanguage: 'Aktuelle Sprache',
    greeting: 'Hallo! Ihre Spracheinstellung wurde gespeichert.',
    description: 'Diese Seite demonstriert den Sprachwechsel mit Cookies, die über Sitzungen hinweg persistent sind.'
  },
  ja: {
    welcome: 'ようこそ',
    language: '言語',
    selectLanguage: 'お好みの言語を選択してください',
    english: '英語',
    spanish: 'スペイン語',
    french: 'フランス語',
    german: 'ドイツ語',
    japanese: '日本語',
    currentLanguage: '現在の言語',
    greeting: 'こんにちは！言語設定が保存されました。',
    description: 'このページは、セッション間で永続するクッキーを使用した言語切り替えを示します。'
  }
};

router.get('/', (req, res) => {
  const lang = req.cookies.language || 'en';
  const t = translations[lang];
  
  res.render('exercise2/index', { 
    currentLanguage: lang,
    translations: t,
    availableLanguages: ['en', 'es', 'fr', 'de', 'ja']
  });
});

router.post('/change-language', (req, res) => {
  const { language } = req.body;
  
  if (!translations[language]) {
    return res.status(400).json({ error: 'Invalid language' });
  }
  
  res.cookie('language', language, { 
    maxAge: 1000 * 60 * 60 * 24 * 365,
    httpOnly: false
  });
  
  res.redirect('/exercise2');
});

router.get('/api/translations', (req, res) => {
  const lang = req.cookies.language || 'en';
  res.json(translations[lang]);
});

module.exports = router;
