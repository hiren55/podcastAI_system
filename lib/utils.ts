import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const translations = {
  en: {
    trending: 'Trending Podcasts',
    discover: 'Discover Trending Podcasts',
    searchResults: 'Search results for',
    filterByLanguage: 'Filter by Language:',
    episodes: 'Episodes',
    addEpisode: 'Add Episode',
    edit: 'Edit',
    delete: 'Delete',
    noEpisodes: 'No episodes yet.',
    // ...add more keys as needed
  },
  hi: {
    trending: 'लोकप्रिय पॉडकास्ट',
    discover: 'लोकप्रिय पॉडकास्ट खोजें',
    searchResults: 'के लिए खोज परिणाम',
    filterByLanguage: 'भाषा द्वारा फ़िल्टर करें:',
    episodes: 'एपिसोड',
    addEpisode: 'एपिसोड जोड़ें',
    edit: 'संपादित करें',
    delete: 'हटाएं',
    noEpisodes: 'कोई एपिसोड नहीं।',
    // ...add more keys as needed
  },
};

export function t(key: string, lang: string = 'en') {
  return translations[lang]?.[key] || translations['en'][key] || key;
}