'use client';

import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext({
    lang: 'en',
    setLang: (lang: string) => { },
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [lang, setLang] = useState('en');
    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
