import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SUPPORTED_LANGUAGES, LANGUAGE_TO_LOCALE } from "@/utils/translationUtils";

// 国旗图标映射
const FLAG_ICONS: Record<string, string> = {
  'en': '🇬🇧',
  'fr': '🇫🇷', 
  'de': '🇩🇪',
  'it': '🇮🇹',
  'es': '🇪🇸'
};

// 语言信息映射
const LANGUAGE_INFO: Record<string, { name: string; native: string }> = {
  'en': { name: 'English', native: 'English' },
  'fr': { name: 'French', native: 'Français' },
  'de': { name: 'German', native: 'Deutsch' },
  'it': { name: 'Italian', native: 'Italiano' },
  'es': { name: 'Spanish', native: 'Español' }
};

export default function LanguageSwitcher() {
  const { currentLanguage, availableLanguages, isLoading, changeLanguage } = useLanguage();

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
  };

  // 获取当前语言的简短代码（从locale格式转换）
  const getCurrentLanguageShortCode = () => {
    const shortCode = currentLanguage.split('-')[0];
    return SUPPORTED_LANGUAGES.includes(shortCode) ? shortCode : 'en';
  };

  const getCurrentLanguageInfo = () => {
    const shortCode = getCurrentLanguageShortCode();
    return {
      language_code: shortCode,
      language_name: LANGUAGE_INFO[shortCode]?.name || 'English',
      language_name_native: LANGUAGE_INFO[shortCode]?.native || 'English'
    };
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Globe size={16} className="mr-2" />
        Loading...
      </Button>
    );
  }

  const currentLang = getCurrentLanguageInfo();
  const currentShortCode = getCurrentLanguageShortCode();

  // 去重并排序语言列表
  const uniqueLanguages = SUPPORTED_LANGUAGES.map(lang => ({
    language_code: lang,
    language_name: LANGUAGE_INFO[lang]?.name || lang,
    language_name_native: LANGUAGE_INFO[lang]?.native || lang,
    is_default: lang === 'en'
  }));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="text-gray-600 hover:text-accent-gold transition-colors duration-300"
        >
          <Globe size={16} className="mr-2" />
          <span className="hidden sm:inline">
            {currentLang?.language_name_native || 'Language'}
          </span>
          <span className="sm:hidden flex items-center">
            <span className="text-xl">{FLAG_ICONS[currentShortCode] || '🇬🇧'}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {uniqueLanguages.map((language) => (
          <DropdownMenuItem
            key={language.language_code}
            onClick={() => handleLanguageChange(language.language_code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{FLAG_ICONS[language.language_code]}</span>
              <div className="flex flex-col">
                <span className="font-medium">{language.language_name_native}</span>
                <span className="text-xs text-gray-500">{language.language_name}</span>
              </div>
            </div>
            {language.language_code === currentShortCode && (
              <Check size={16} className="text-accent-gold" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
