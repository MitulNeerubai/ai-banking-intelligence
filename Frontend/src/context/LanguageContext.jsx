import { createContext, useContext, useState, useCallback } from 'react';

const LANG_KEY = 'guidespend_lang';

// ── Translations ───────────────────────────────────────────────
export const TRANSLATIONS = {
  en: {
    // Navbar
    profile: 'Profile',
    settings: 'Settings',
    contact_us: 'Contact Us',
    sign_out: 'Sign Out',
    // Page header
    dashboard: 'Dashboard',
    subtitle: 'Your complete financial overview',
    // Linked Accounts section
    linked_accounts: 'Linked Accounts',
    view_all: 'View All',
    click_to_filter: 'Click to filter',
    no_accounts: 'No accounts linked yet.',
    no_accounts_hint: 'Connect your first bank using the button above.',
    // Summary cards
    total_balance: 'Total Balance',
    total_income: 'Total Income',
    total_spending: 'Total Spending',
    from_transactions: 'From displayed transactions',
    expense_txns: '{n} expense transactions',
    across_accounts: 'Across {n} account{s}',
    // Sections
    analytics: 'Analytics',
    recent_transactions: 'Recent Transactions',
    // Loading
    loading: 'Loading dashboard…',
    // Settings modal
    language: 'Language',
    preferences: 'Preferences',
    spending_alerts: 'Spending Alerts',
    dark_mode: 'Dark Mode',
    always_on: 'Always On',
    save: 'Save Preferences',
    saved: 'Saved!',
    // Contact modal
    team_label: 'Team',
    institution_label: 'Institution',
    email_label: 'Email',
    // Profile modal
    no_linked: 'No accounts linked yet.',
    linked_accounts_count: 'Linked Accounts ({n})',
    // Footer
    footer: 'GuideSpend AI - Team 8, University of Missouri-Kansas City',
  },
  es: {
    profile: 'Perfil',
    settings: 'Configuración',
    contact_us: 'Contáctanos',
    sign_out: 'Cerrar Sesión',
    dashboard: 'Panel',
    subtitle: 'Tu resumen financiero completo',
    linked_accounts: 'Cuentas Vinculadas',
    view_all: 'Ver Todo',
    click_to_filter: 'Clic para filtrar',
    no_accounts: 'Aún no hay cuentas vinculadas.',
    no_accounts_hint: 'Conecta tu primer banco con el botón de arriba.',
    total_balance: 'Saldo Total',
    total_income: 'Ingresos Totales',
    total_spending: 'Gastos Totales',
    from_transactions: 'De las transacciones mostradas',
    expense_txns: '{n} transacciones de gastos',
    across_accounts: 'En {n} cuenta{s}',
    analytics: 'Análisis',
    recent_transactions: 'Transacciones Recientes',
    loading: 'Cargando panel…',
    language: 'Idioma',
    preferences: 'Preferencias',
    spending_alerts: 'Alertas de Gastos',
    dark_mode: 'Modo Oscuro',
    always_on: 'Siempre Activo',
    save: 'Guardar',
    saved: '¡Guardado!',
    team_label: 'Equipo',
    institution_label: 'Institución',
    email_label: 'Correo',
    no_linked: 'No hay cuentas vinculadas.',
    linked_accounts_count: 'Cuentas Vinculadas ({n})',
    footer: 'GuideSpend AI - Equipo 8, Universidad de Missouri-Kansas City',
  },
  fr: {
    profile: 'Profil',
    settings: 'Paramètres',
    contact_us: 'Contactez-nous',
    sign_out: 'Déconnexion',
    dashboard: 'Tableau de bord',
    subtitle: 'Votre aperçu financier complet',
    linked_accounts: 'Comptes liés',
    view_all: 'Voir tout',
    click_to_filter: 'Cliquer pour filtrer',
    no_accounts: "Aucun compte lié pour l'instant.",
    no_accounts_hint: 'Connectez votre première banque avec le bouton ci-dessus.',
    total_balance: 'Solde total',
    total_income: 'Revenus totaux',
    total_spending: 'Dépenses totales',
    from_transactions: 'Des transactions affichées',
    expense_txns: '{n} transactions de dépenses',
    across_accounts: 'Sur {n} compte{s}',
    analytics: 'Analytique',
    recent_transactions: 'Transactions récentes',
    loading: 'Chargement…',
    language: 'Langue',
    preferences: 'Préférences',
    spending_alerts: 'Alertes dépenses',
    dark_mode: 'Mode sombre',
    always_on: 'Toujours actif',
    save: 'Enregistrer',
    saved: 'Enregistré !',
    team_label: 'Équipe',
    institution_label: 'Institution',
    email_label: 'E-mail',
    no_linked: 'Aucun compte lié.',
    linked_accounts_count: 'Comptes liés ({n})',
    footer: 'GuideSpend AI - Équipe 8, Université du Missouri-Kansas City',
  },
  de: {
    profile: 'Profil',
    settings: 'Einstellungen',
    contact_us: 'Kontakt',
    sign_out: 'Abmelden',
    dashboard: 'Dashboard',
    subtitle: 'Ihr vollständiger Finanzüberblick',
    linked_accounts: 'Verknüpfte Konten',
    view_all: 'Alle anzeigen',
    click_to_filter: 'Zum Filtern klicken',
    no_accounts: 'Noch keine Konten verknüpft.',
    no_accounts_hint: 'Verbinden Sie Ihre erste Bank mit der Schaltfläche oben.',
    total_balance: 'Gesamtguthaben',
    total_income: 'Gesamteinkommen',
    total_spending: 'Gesamtausgaben',
    from_transactions: 'Aus den angezeigten Transaktionen',
    expense_txns: '{n} Ausgabentransaktionen',
    across_accounts: 'Über {n} Konto{s}',
    analytics: 'Analytik',
    recent_transactions: 'Letzte Transaktionen',
    loading: 'Dashboard wird geladen…',
    language: 'Sprache',
    preferences: 'Einstellungen',
    spending_alerts: 'Ausgabenbenachrichtigungen',
    dark_mode: 'Dunkelmodus',
    always_on: 'Immer ein',
    save: 'Speichern',
    saved: 'Gespeichert!',
    team_label: 'Team',
    institution_label: 'Institution',
    email_label: 'E-Mail',
    no_linked: 'Keine Konten verknüpft.',
    linked_accounts_count: 'Verknüpfte Konten ({n})',
    footer: 'GuideSpend AI - Team 8, Universität Missouri-Kansas City',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(LANG_KEY) || 'en'
  );

  const setLanguage = useCallback((lang) => {
    if (TRANSLATIONS[lang]) {
      localStorage.setItem(LANG_KEY, lang);
      setLanguageState(lang);
    }
  }, []);

  // t(key, { n: 3, s: 's' }) — interpolates {n}, {s}, etc.
  const t = useCallback(
    (key, params = {}) => {
      const str = TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.en[key] ?? key;
      return str.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? ''));
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
