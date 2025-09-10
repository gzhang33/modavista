import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_TO_LOCALE } from "@/utils/translationUtils";
import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalPath?: string;
}

export default function SEOHead({
  title,
  description,
  keywords,
  canonicalPath = ""
}: SEOHeadProps) {
  const { t, currentLanguage, availableLanguages } = useLanguage();

  // 默认SEO内容（英文）
  // 默认SEO内容（英文）
  const defaultSEO = {
    title: 'seo.title',
    description: 'seo.description',
    keywords: 'seo.keywords'
  };

  // 多语言SEO内容
  const localizedSEO = {
    'en-GB': defaultSEO,
    'fr-FR': {
      title: 'seo.fr.title',
      description: 'seo.fr.description',
      keywords: 'seo.fr.keywords'
    },
    'de-DE': {
      title: 'seo.de.title',
      description: 'seo.de.description',
      keywords: 'seo.de.keywords'
    },
    'it-IT': {
      title: 'seo.it.title',
      description: 'seo.it.description',
      keywords: 'seo.it.keywords'
    },
    'es-ES': {
      title: 'seo.es.title',
      description: 'seo.es.description',
      keywords: 'seo.es.keywords'
    }
  };

  // 获取当前语言的SEO内容
  const currentSEO = localizedSEO[LANGUAGE_TO_LOCALE[currentLanguage] as keyof typeof localizedSEO] || defaultSEO;

  // 最终SEO内容（允许props覆盖）
  const finalTitle = title || t(currentSEO.title);
  const finalDescription = description || t(currentSEO.description);
  const finalKeywords = keywords || t(currentSEO.keywords);

  useEffect(() => {
    // 更新页面标题
    document.title = finalTitle;

    // 更新或创建meta标签
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);

    // 添加Open Graph标签
    updateMetaTag('og:title', finalTitle, 'property');
    updateMetaTag('og:description', finalDescription, 'property');
    updateMetaTag('og:type', 'website', 'property');

    // 添加多语言hreflang标签
    updateHreflangTags(canonicalPath);

    // 添加规范链接
    updateCanonicalLink(canonicalPath);

  }, [finalTitle, finalDescription, finalKeywords, currentLanguage, canonicalPath]);

  return null; // 这个组件不渲染任何内容，只管理head标签
}

// 辅助函数：更新meta标签
function updateMetaTag(name: string, content: string, attribute: string = 'name') {
  let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }

  meta.content = content;
}

// 辅助函数：更新hreflang标签
function updateHreflangTags(canonicalPath: string) {
  // 移除现有的hreflang标签
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(tag => tag.remove());

  const baseUrl = window.location.origin;
  const path = canonicalPath || window.location.pathname.replace(/^\/[a-z]{2}/, '') || '/';

  // 支持的语言映射
  const languages = [
    { code: 'en', locale: 'en-GB' },
    { code: 'fr', locale: 'fr-FR' },
    { code: 'de', locale: 'de-DE' },
    { code: 'it', locale: 'it-IT' },
    { code: 'es', locale: 'es-ES' }
  ];

  languages.forEach(({ code, locale }) => {
    const href = code === 'en' ? `${baseUrl}${path}` : `${baseUrl}/${code}${path}`;

    const link = document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = locale;
    link.href = href;

    document.head.appendChild(link);
  });

  // 添加x-default标签（指向英文版本）
  const defaultLink = document.createElement('link');
  defaultLink.rel = 'alternate';
  defaultLink.hreflang = 'x-default';
  defaultLink.href = `${baseUrl}${path}`;
  document.head.appendChild(defaultLink);
}

// 辅助函数：更新规范链接
function updateCanonicalLink(canonicalPath: string) {
  let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }

  const baseUrl = window.location.origin;
  const path = canonicalPath || window.location.pathname;
  canonical.href = `${baseUrl}${path}`;
}


