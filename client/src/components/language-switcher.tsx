import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSwitcher() {
  const { currentLanguage, availableLanguages, isLoading, changeLanguage } = useLanguage();

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
  };

  const getCurrentLanguageInfo = () => {
    return availableLanguages.find(lang => lang.language_code === currentLanguage) || availableLanguages[0];
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
            {currentLang?.language_name_native || currentLang?.language_name || 'Language'}
          </span>
          <span className="sm:hidden">
            {currentLang?.language_code?.toUpperCase() || 'EN'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.language_code}
            onClick={() => handleLanguageChange(language.language_code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col">
              <span className="font-medium">{language.language_name_native}</span>
              <span className="text-xs text-gray-500">{language.language_name}</span>
            </div>
            {language.language_code === currentLanguage && (
              <Check size={16} className="text-accent-gold" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
