import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations, Language, translateData } from '../translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: keyof typeof translations.en) => string;
    translateData: (data: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');

    const t = (key: keyof typeof translations.en): string => {
        // @ts-ignore
        return translations[language][key] || translations.en[key] || String(key);
    };

    const _translateData = (data: string): string => {
        return translateData(data, language);
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translateData: _translateData }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
