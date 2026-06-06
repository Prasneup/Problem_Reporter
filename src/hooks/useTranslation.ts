import { useCivicStore } from '../stores/civicStore';
import { TRANSLATIONS } from '../constants/localization';

export function useTranslation() {
  const language = useCivicStore((state) => state.language);
  const setLanguage = useCivicStore((state) => state.setLanguage);

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || key;
  };

  return { t, language, setLanguage };
}
export default useTranslation;
