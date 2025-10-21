'use client';

import { useLanguage } from '@/providers/LanguageProvider';

export default function LanguageSelector() {
    const { lang, setLang } = useLanguage();
    return (
        <div className="flex items-center gap-2 py-2">
            <label htmlFor="ui-lang" className="text-white-1 font-bold">🌐 Language:</label>
            <select
                id="ui-lang"
                className="input-class"
                value={lang}
                onChange={e => setLang(e.target.value)}
            >
                <option value="en">English</option>
                <option value="hi">हिन्दी</option>
            </select>
        </div>
    );
}
