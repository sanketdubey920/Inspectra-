import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../translations';

export type { Language };
export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const legacyTranslations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'INSPECTRA',
    tagline: 'Integrated Risk-Based Monitoring & Inspection Platform',
    heroSubtitle: 'Enabling transparent, intelligent and evidence-based monitoring of government-supported institutions and projects.',
    exploreMonitoring: 'Explore Monitoring',
    officialLogin: 'Official Login',
    dashboard: 'Department Dashboard',
    monitoringMap: 'Monitoring Map',
    institutes: 'Institutes',
    inspections: 'Inspections',
    correctiveActions: 'Corrective Actions',
    cctvMonitoring: 'CCTV Monitoring',
    alerts: 'Alerts',
    reports: 'Reports',
    auditLogs: 'Audit Logs',
    beneficiaryReports: 'Beneficiary Reports',
    beneficiaryFeedback: 'Beneficiary Grievance',
    totalInstitutes: 'Total Institutes',
    activeInstitutes: 'Active Institutions',
    highRisk: 'High Risk',
    criticalRisk: 'Critical Risk',
    pendingInspections: 'Pending Inspections',
    openAlerts: 'Open Alerts',
    overdueActions: 'Overdue Corrective Actions',
    riskScore: 'Risk Score',
    riskLevel: 'Risk Level',
    recommendation: 'Recommendation',
    recommendInspection: 'Recommend Surprise Inspection',
    assignOfficer: 'Assign PMU / Inspection Officer',
    gpsVerified: 'GPS Verified',
    locationMismatch: 'Location Mismatch',
    targetedChecklist: 'Targeted Inspection Checklist',
    evidenceGallery: 'Geo-Tagged Evidence Gallery',
    recalculateRisk: 'Recalculate Risk',
    resolved: 'Resolved',
    pending: 'Pending',
    disclaimerAI: 'AI is a decision-support mechanism. Human authorized officers remain final decision-makers.',
  },
  hi: {
    appName: 'इंस्पेक्ट्रा (INSPECTRA)',
    tagline: 'एकीकृत जोखिम-आधारित निगरानी एवं निरीक्षण मंच',
    heroSubtitle: 'सरकारी सहायता प्राप्त संस्थानों और परियोजनाओं की पारदर्शी, बुद्धिमान और साक्ष्य-आधारित निगरानी।',
    exploreMonitoring: 'निगरानी देखें',
    officialLogin: 'अधिकारी लॉगिन',
    dashboard: 'विभागीय डैशबोर्ड',
    monitoringMap: 'अखिल भारतीय निगरानी मानचित्र',
    institutes: 'संस्थान',
    inspections: 'निरीक्षण',
    correctiveActions: 'सुधारात्मक कार्रवाई',
    cctvMonitoring: 'सीसीटीवी निगरानी',
    alerts: 'अलर्ट',
    reports: 'रिपोर्ट्स',
    auditLogs: 'ऑडिट लॉग',
    beneficiaryReports: 'लाभार्थी रिपोर्ट',
    beneficiaryFeedback: 'लाभार्थी शिकायत',
    totalInstitutes: 'कुल संस्थान',
    activeInstitutes: 'सक्रिय संस्थान',
    highRisk: 'उच्च जोखिम',
    criticalRisk: 'गंभीर जोखिम',
    pendingInspections: 'लंबित निरीक्षण',
    openAlerts: 'सक्रिय अलर्ट',
    overdueActions: 'विलंबित सुधारात्मक कार्रवाई',
    riskScore: 'जोखिम स्कोर',
    riskLevel: 'जोखिम स्तर',
    recommendation: 'सिफारिश',
    recommendInspection: 'आकस्मिक निरीक्षण की अनुशंसा करें',
    assignOfficer: 'पीएमयू / निरीक्षण अधिकारी नियुक्त करें',
    gpsVerified: 'जीपीएस सत्यापित',
    locationMismatch: 'स्थान बेमेल',
    targetedChecklist: 'लक्षित निरीक्षण चेकलिस्ट',
    evidenceGallery: 'भू-टैग युक्त साक्ष्य गैलरी',
    recalculateRisk: 'जोखिम पुनर्गणना',
    resolved: 'समाधान हो चुका',
    pending: 'लंबित',
    disclaimerAI: 'एआई एक निर्णय-समर्थन प्रणाली है। अंतिम निर्णय अधिकृत मानव अधिकारियों द्वारा ही लिया जाता है।',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('inspectra_theme') as Theme) || 'light');
  const [language, setLanguageState] = useState<Language>(() => (localStorage.getItem('inspectra_lang') as Language) || 'en');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('inspectra_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('inspectra_lang', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  const toggleLanguage = () => setLanguageState((prev) => (prev === 'en' ? 'hi' : 'en'));
  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: string): string => {
    return translations[language]?.[key] || 
           translations['en']?.[key] || 
           legacyTranslations[language]?.[key] || 
           legacyTranslations['en']?.[key] || 
           key;
  };

  return (
    <ThemeContext.Provider value={{ theme, language, toggleTheme, toggleLanguage, setLanguage, t }}>
      {children}
    </ThemeContext.Provider>
  );
};

const defaultThemeContext: ThemeContextType = {
  theme: 'light',
  language: 'hi',
  toggleTheme: () => {},
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: (key: string) => translations['hi']?.[key] || translations['en']?.[key] || key,
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  return context || defaultThemeContext;
};
