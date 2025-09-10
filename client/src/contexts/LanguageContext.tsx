import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  loadStaticTranslations,
  translateSync,
  clearTranslationCache,
  getDynamicTranslation,
  detectLanguagePriority,
  shouldRedirectToLocalizedPath,
  redirectToLocalizedPath,
  saveLanguagePreference,
  LANGUAGE_TO_LOCALE
} from '@/utils/translationUtils';

interface Language {
  language_code: string;
  language_name: string;
  language_name_native: string;
  is_default: boolean;
}

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: Language[];
  staticTranslations: Record<string, any>;
  isLoading: boolean;
  isInitialized: boolean;
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
  tAsync: (key: string, fallback?: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [staticTranslations, setStaticTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // 获取可用语言列表
  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/language.php?action=languages');
      const data = await response.json();
      
      if (data.languages && data.current) {
        setAvailableLanguages(data.languages);
        setCurrentLanguage(data.current);
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      // 设置可用语言（英文、法语、德语、意大利语、西班牙语）
      setAvailableLanguages([
        { language_code: 'en', language_name: 'English', language_name_native: 'English', is_default: true },
        { language_code: 'fr', language_name: 'French', language_name_native: 'Français', is_default: false },
        { language_code: 'de', language_name: 'German', language_name_native: 'Deutsch', is_default: false },
        { language_code: 'it', language_name: 'Italian', language_name_native: 'Italiano', is_default: false },
        { language_code: 'es', language_name: 'Spanish', language_name_native: 'Español', is_default: false }
      ]);
    }
  };

  // 获取静态翻译内容
  const fetchStaticTranslations = async (languageCode: string) => {
    try {
      const translations = await loadStaticTranslations(languageCode);
      setStaticTranslations(translations);
      return translations;
    } catch (error) {
      console.error('Failed to fetch static translations:', error);
      // 设置默认的英文静态翻译
      const defaultTranslations = {
        nav: {
          home: 'Home',
          collections: 'Collections',
          about: 'About',
          contact: 'Contact'
        },
        home: {
          title: 'DreaModa - Italian Fashion Excellence',
          hero: {
            title: 'Premium Wholesale Garment Collection',
            subtitle: 'Discover our curated selection of high-quality garments crafted for discerning wholesale partners',
            explore: 'Explore Collections',
            samples: 'Request Samples'
          }
        },
        common: {
          loading: 'Loading...',
          error: 'An error occurred'
        }
      };
      setStaticTranslations(defaultTranslations);
      return defaultTranslations;
    }
  };

  // 初始化语言检测（混合方案）
  const initializeLanguage = async () => {
    try {
      console.log('Initializing language with hybrid approach...');

      // 1. 使用混合方案检测语言优先级
      const detectedLanguage = detectLanguagePriority();
      console.log('Detected language:', detectedLanguage);

      // 2. 获取可用语言列表
      await fetchLanguages();

      // 3. 设置检测到的语言
      setCurrentLanguage(detectedLanguage);

      // 4. 加载对应语言的静态翻译
      await fetchStaticTranslations(detectedLanguage);

      setIsInitialized(true);
      setIsLoading(false);

      console.log('Language initialization completed:', detectedLanguage);
    } catch (error) {
      console.error('Language initialization failed:', error);
      // 回退到英文
      setCurrentLanguage('en');
      await fetchStaticTranslations('en');
      setIsInitialized(true);
      setIsLoading(false);
    }
  };

  // 切换语言（混合方案）
  const changeLanguage = async (languageCode: string) => {
    try {
      console.log('Changing language to:', languageCode);
      setIsLoading(true);

      // 清空翻译缓存
      clearTranslationCache();

      // 将locale格式转换为简短格式用于路由
      const shortLangCode = languageCode.split('-')[0];

      // 保存用户语言偏好（使用locale格式）
      saveLanguagePreference(languageCode);

      // 检查是否需要URL重定向
      if (shouldRedirectToLocalizedPath(currentLanguage, shortLangCode)) {
        console.log('URL redirect needed for language change');
        redirectToLocalizedPath(shortLangCode);
        return; // 重定向后函数结束，不需要继续执行
      }

      // 如果不需要重定向，正常处理（Session/Cookie方式）
      setCurrentLanguage(languageCode);
      await fetchStaticTranslations(languageCode);

      // 设置后端语言偏好
      try {
        const response = await fetch('/api/language.php?action=set_language', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language_code: LANGUAGE_TO_LOCALE[languageCode] || languageCode
          }),
        });

        if (!response.ok) {
          console.error('Failed to set backend language preference');
        }
      } catch (backendError) {
        console.error('Error setting backend language preference:', backendError);
        // 后端错误不影响前端语言切换
      }

      setIsLoading(false);
      console.log('Language change completed without redirect');
    } catch (error) {
      console.error('Error changing language:', error);
      setIsLoading(false);
    }
  };

  // 同步翻译函数（用于静态翻译）
  const t = (key: string, fallback?: string): string => {
    return translateSync(staticTranslations, key, fallback);
  };

  // 异步翻译函数（用于动态翻译）
  const tAsync = async (key: string, fallback?: string): Promise<string> => {
    // 先尝试静态翻译
    const staticValue = translateSync(staticTranslations, key);
    if (staticValue !== key) {
      return staticValue;
    }

    // 如果静态翻译中没有，尝试动态翻译
    return await getDynamicTranslation(key, currentLanguage, fallback);
  };

  // 初始化（混合方案）
  useEffect(() => {
    initializeLanguage();
  }, []);

  // 当语言改变时重新获取静态翻译（避免初始化时的重复加载）
  useEffect(() => {
    if (isInitialized && currentLanguage && !isLoading) {
      console.log('Language changed, reloading translations:', currentLanguage);
      fetchStaticTranslations(currentLanguage);
    }
  }, [currentLanguage, isInitialized]);

  const value: LanguageContextType = {
    currentLanguage,
    availableLanguages,
    staticTranslations,
    isLoading,
    isInitialized,
    changeLanguage,
    t,
    tAsync
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
