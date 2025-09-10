// 翻译工具函数 - 支持混合模式（静态文件 + 数据库）

// 静态翻译缓存
const staticTranslations: Record<string, Record<string, any>> = {};

// 动态翻译缓存（来自数据库）
const dynamicTranslations: Record<string, Record<string, string>> = {};

// 加载静态翻译文件
export async function loadStaticTranslations(languageCode: string): Promise<Record<string, any>> {
  if (staticTranslations[languageCode]) {
    return staticTranslations[languageCode];
  }

  try {
    // 将locale代码转换为文件名格式 (fr-FR -> fr)
    const fileName = languageCode.split('-')[0];
    const response = await fetch(`/locales/${fileName}.json`);
    if (response.ok) {
      const translations = await response.json();
      staticTranslations[languageCode] = translations;
      return translations;
    } else {
      console.warn(`Translation file for ${languageCode} not found, using default translations`);
      // 如果文件不存在，尝试返回英文翻译作为后备
      if (languageCode !== 'en') {
        console.warn(`Translation file for ${languageCode} not found, falling back to English`);
        return loadStaticTranslations('en');
      }

      // 如果是英文文件不存在，返回默认英文翻译
      const defaultTranslations = {
        nav: {
          home: "Home",
          collections: "Collections",
          about: "About",
          contact: "Contact"
        },
        home: {
          title: "DreaModa - Italian Fashion Excellence",
          hero: {
            title: "Premium Wholesale Garment Collection",
            subtitle: "Discover our curated selection of high-quality garments crafted for discerning wholesale partners",
            explore: "Explore Collections",
            samples: "Request Samples"
          }
        },
        common: {
          loading: "Loading...",
          error: "An error occurred",
          retry: "Try Again"
        }
      };
      staticTranslations[languageCode] = defaultTranslations;
      return defaultTranslations;
    }
  } catch (error) {
    console.warn(`Failed to load static translations for ${languageCode}:`, error);
  }

  return {};
}

// 获取嵌套对象的值
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// 从静态翻译中获取值
export function getStaticTranslation(
  translations: Record<string, any>,
  key: string,
  fallback?: string
): string | null {
  const value = getNestedValue(translations, key);
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

// 从数据库获取动态翻译（缓存版本）
export async function getDynamicTranslation(
  key: string,
  languageCode: string,
  fallback?: string
): Promise<string> {
  // 检查缓存
  if (dynamicTranslations[languageCode]?.[key]) {
    return dynamicTranslations[languageCode][key];
  }

  try {
    const response = await fetch(`/api/language.php?action=translation&key=${encodeURIComponent(key)}&lang=${languageCode}`);
    const data = await response.json();

    if (data.text) {
      // 缓存结果
      if (!dynamicTranslations[languageCode]) {
        dynamicTranslations[languageCode] = {};
      }
      dynamicTranslations[languageCode][key] = data.text;
      return data.text;
    }
  } catch (error) {
    console.warn(`Failed to fetch dynamic translation for key "${key}":`, error);
  }

  return fallback || key;
}

// 主翻译函数
export async function translate(
  key: string,
  languageCode: string,
  fallback?: string
): Promise<string> {
  // 1. 先尝试从静态翻译获取
  const staticTranslations = await loadStaticTranslations(languageCode);
  const staticValue = getStaticTranslation(staticTranslations, key);

  if (staticValue) {
    return staticValue;
  }

  // 2. 如果静态翻译中没有，尝试从数据库获取
  return await getDynamicTranslation(key, languageCode, fallback);
}

// 同步翻译函数（用于已加载的静态翻译）
export function translateSync(
  staticTranslations: Record<string, any>,
  key: string,
  fallback?: string
): string {
  const staticValue = getStaticTranslation(staticTranslations, key);
  if (staticValue) {
    return staticValue;
  }
  return fallback || key;
}

// 清空缓存（用于语言切换）
export function clearTranslationCache(): void {
  Object.keys(staticTranslations).forEach(key => {
    delete staticTranslations[key];
  });
  Object.keys(dynamicTranslations).forEach(key => {
    delete dynamicTranslations[key];
  });
}

// 获取所有静态翻译键
export function getAllStaticKeys(languageCode: string): Promise<string[]> {
  return loadStaticTranslations(languageCode).then(translations => {
    const keys: string[] = [];

    function extractKeys(obj: any, prefix = ''): void {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'string') {
          keys.push(fullKey);
        } else if (typeof value === 'object' && value !== null) {
          extractKeys(value, fullKey);
        }
      }
    }

    extractKeys(translations);
    return keys;
  });
}

// =============================================
// 混合方案：URL路径语言检测工具函数
// =============================================

// 支持的语言代码映射
export const SUPPORTED_LANGUAGES = ['en', 'fr', 'de', 'it', 'es'];
export const LANGUAGE_TO_LOCALE: Record<string, string> = {
  'en': 'en-GB',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'es': 'es-ES'
};

// 从URL路径检测语言代码
export function getLanguageFromURL(): string | null {
  if (typeof window === 'undefined') return null;

  const pathSegments = window.location.pathname.split('/').filter(Boolean);

  // 检查第一个路径段是否为支持的语言代码
  if (pathSegments.length > 0) {
    const potentialLang = pathSegments[0].toLowerCase();
    if (SUPPORTED_LANGUAGES.includes(potentialLang)) {
      return potentialLang;
    }
  }

  return null;
}

// 从Session Storage获取语言
export function getLanguageFromSession(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('user_language');
}

// 从Local Storage获取语言
export function getLanguageFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('user_language');
}

// 从浏览器语言检测
export function getLanguageFromBrowser(): string | null {
  if (typeof window === 'undefined') return null;

  const browserLang = navigator.language.split('-')[0].toLowerCase();
  return SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : null;
}

// 混合方案语言检测优先级
export function detectLanguagePriority(): string {
  // 优先级：URL路径 > Session Storage > Local Storage > 浏览器语言 > 默认英文

  // 1. 检查URL路径
  const urlLang = getLanguageFromURL();
  if (urlLang) {
    console.log('Language detected from URL path:', urlLang);
    return urlLang;
  }

  // 2. 检查Session Storage
  const sessionLang = getLanguageFromSession();
  if (sessionLang && SUPPORTED_LANGUAGES.includes(sessionLang)) {
    console.log('Language detected from Session Storage:', sessionLang);
    return sessionLang;
  }

  // 3. 检查Local Storage
  const localLang = getLanguageFromLocalStorage();
  if (localLang && SUPPORTED_LANGUAGES.includes(localLang)) {
    console.log('Language detected from Local Storage:', localLang);
    return localLang;
  }

  // 4. 检查浏览器语言
  const browserLang = getLanguageFromBrowser();
  if (browserLang) {
    console.log('Language detected from browser:', browserLang);
    return browserLang;
  }

  // 5. 默认返回英文
  console.log('Using default language: en');
  return 'en';
}

// 构建带语言前缀的URL路径
export function buildLocalizedPath(path: string, languageCode: string): string {
  console.log('buildLocalizedPath:', { path, languageCode });

  // 如果是默认语言（英文），不添加语言前缀
  if (languageCode === 'en') {
    console.log('Returning path as-is for English:', path);
    return path;
  }

  // 确保路径以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  console.log('Normalized path:', normalizedPath);

  // 如果路径已经是带语言前缀的，替换语言代码
  const pathSegments = normalizedPath.split('/').filter(Boolean);
  console.log('Path segments:', pathSegments);

  if (pathSegments.length > 0 && SUPPORTED_LANGUAGES.includes(pathSegments[0])) {
    // 替换现有的语言前缀
    const newPath = `/${languageCode}${normalizedPath.substring(pathSegments[0].length + 1)}`;
    console.log('Replacing existing language prefix:', newPath);
    return newPath;
  }

  // 添加语言前缀
  const finalPath = `/${languageCode}${normalizedPath}`;
  console.log('Adding language prefix:', finalPath);
  return finalPath;
}

// 获取当前路径的无语言前缀版本
export function getPathWithoutLanguage(): string {
  if (typeof window === 'undefined') return '/';

  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0 && SUPPORTED_LANGUAGES.includes(pathSegments[0])) {
    return '/' + pathSegments.slice(1).join('/');
  }

  return window.location.pathname;
}

// 保存用户语言偏好
export function saveLanguagePreference(languageCode: string): void {
  if (typeof window === 'undefined') return;

  // 保存到Session Storage（会话级别）
  sessionStorage.setItem('user_language', languageCode);

  // 保存到Local Storage（持久化）
  localStorage.setItem('user_language', languageCode);

  console.log('Language preference saved:', languageCode);
}

// 检查当前URL是否需要重定向
export function shouldRedirectToLocalizedPath(currentLang: string, targetLang: string): boolean {
  const urlLang = getLanguageFromURL();

  console.log('shouldRedirectToLocalizedPath:', {
    currentLang,
    targetLang,
    urlLang,
    currentPath: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
  });

  // 如果目标语言是英文且URL中没有语言前缀，不需要重定向
  if (targetLang === 'en' && !urlLang) {
    console.log('No redirect needed: target is English and no URL language prefix');
    return false;
  }

  // 将currentLang也转换为简短格式进行比较
  const currentShortLang = currentLang.split('-')[0];

  // 如果URL语言与目标语言不匹配，需要重定向
  const needsRedirect = urlLang !== targetLang;
  console.log('Redirect needed:', needsRedirect, `because URL lang (${urlLang}) !== target lang (${targetLang})`);
  return needsRedirect;
}

// 执行语言切换重定向
export function redirectToLocalizedPath(targetLang: string): void {
  if (typeof window === 'undefined') return;

  const currentPath = getPathWithoutLanguage();
  const newPath = buildLocalizedPath(currentPath, targetLang);

  console.log('redirectToLocalizedPath:', {
    targetLang,
    currentPath,
    newPath,
    currentFullPath: window.location.pathname
  });

  // 保存语言偏好
  saveLanguagePreference(targetLang);

  // 执行重定向
  console.log('Redirecting to:', newPath);
  window.location.href = newPath;
}

// =============================================
// 混合方案：多语言链接工具函数
// =============================================

// 获取当前语言的路径前缀
export function getCurrentLanguagePrefix(): string {
  const urlLang = getLanguageFromURL();
  return urlLang && urlLang !== 'en' ? `/${urlLang}` : '';
}

// 生成多语言路径的链接
export function createLocalizedHref(path: string): string {
  const langPrefix = getCurrentLanguagePrefix();
  // 如果是绝对路径（如 /products），添加语言前缀
  if (path.startsWith('/')) {
    return `${langPrefix}${path}`;
  }
  // 如果是相对路径，直接返回
  return path;
}

// React组件使用的多语言链接生成器
export function useLocalizedHref() {
  return (path: string) => createLocalizedHref(path);
}

// 检查路径是否需要语言前缀
export function shouldAddLanguagePrefix(path: string): boolean {
  // 只有绝对路径且当前有非英文语言时才添加前缀
  const urlLang = getLanguageFromURL();
  return path.startsWith('/') && urlLang && urlLang !== 'en';
}
