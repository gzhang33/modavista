import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Language {
  language_code: string;
  language_name: string;
  language_name_native: string;
  is_default: boolean;
}

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: Language[];
  translations: Record<string, string>;
  isLoading: boolean;
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

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
      // 设置默认语言
      setAvailableLanguages([
        { language_code: 'en', language_name: 'English', language_name_native: 'English', is_default: true },
        { language_code: 'zh', language_name: 'Chinese', language_name_native: '中文', is_default: false }
      ]);
    }
  };

  // 获取翻译内容
  const fetchTranslations = async (languageCode: string) => {
    try {
      const response = await fetch(`/api/language.php?action=translations&lang=${languageCode}`);
      const data = await response.json();
      
      if (data.translations) {
        setTranslations(data.translations);
      }
    } catch (error) {
      console.error('Failed to fetch translations:', error);
      // 设置默认翻译
      setTranslations({
        'home.title': 'DreaModa - Italian Fashion Excellence',
        'home.hero.title': 'Premium Wholesale Garment Collection',
        'home.hero.subtitle': 'Discover our curated selection of high-quality garments crafted for discerning wholesale partners',
        'home.hero.explore': 'Explore Collections',
        'home.hero.samples': 'Request Samples',
        'nav.home': 'Home',
        'nav.collections': 'Collections',
        'nav.about': 'About',
        'nav.contact': 'Contact',
        'home.categories.title': 'Shop Garments by Category',
        'home.categories.subtitle': 'Explore our diverse collection of premium fashion garments across different categories',
        'home.featured.title': 'Featured Collection',
        'home.featured.subtitle': 'Handpicked selections from our latest seasonal collection, showcasing exceptional craftsmanship and contemporary design',
        'home.featured.view_all': 'View Complete Collection',
        'home.about.title': 'Crafting Dreams Into Fashion',
        'home.about.description1': 'DreaModa represents the perfect fusion of Italian fashion heritage and contemporary design. Our atelier combines traditional craftsmanship with innovative techniques to create exceptional garments that embody elegance, quality, and modern sophistication.',
        'home.about.description2': 'Based in the heart of Milano, we specialize in creating unique pieces that reflect individual style and personality. Our commitment to excellence and attention to detail ensures that each creation meets the highest standards of Italian fashion tradition.',
        'home.about.designs': 'Fashion Designs',
        'home.about.experience': 'Years Experience',
        'home.contact.title': 'Connect With DreaModa',
        'home.contact.subtitle': 'Discover our exclusive fashion collections. Contact us for inquiries, appointments, or to learn more about our bespoke services.',
        'home.contact.form.title': 'Request Information',
        'home.contact.form.first_name': 'First Name',
        'home.contact.form.last_name': 'Last Name',
        'home.contact.form.email': 'Business Email',
        'home.contact.form.company': 'Company Name',
        'home.contact.form.business_type': 'Business Type',
        'home.contact.form.requirements': 'Tell us about your requirements...',
        'home.contact.form.submit': 'Send Inquiry',
        'home.contact.info.title': 'Get In Touch',
        'home.contact.info.headquarters': 'DreaModa Headquarters',
        'home.contact.info.address': 'Via della Moda, 123\n20121 Milano, Italia',
        'home.contact.info.inquiries': 'Business Inquiries',
        'home.contact.info.phone': '+39 02 1234 5678\nMon - Fri, 9:00 AM - 6:00 PM CET',
        'home.contact.info.email': 'Email',
        'home.contact.info.email_address': 'Hi@DreaModa.store',
        'home.contact.visit.title': 'Visit Our Atelier',
        'home.contact.visit.appointments': 'Private appointments available',
        'home.contact.visit.consultations': 'Bespoke design consultations',
        'home.contact.visit.previews': 'Seasonal collection previews',
        'home.contact.visit.services': 'Made-to-measure services',
        'footer.description': 'Premium fashion manufacturer and designer, creating exceptional garments for discerning customers worldwide with Italian craftsmanship and modern style.',
        'footer.quick_links': 'Quick Links',
        'footer.all_products': 'All Products',
        'footer.collections': 'Collections',
        'footer.categories': 'Categories',
        'footer.about_us': 'About Us',
        'footer.contact': 'Contact',
        'footer.copyright': '© 2025 DREAMODA. All rights reserved. | Made with passion for fashion in Milano, Italia.'
      });
    }
  };

  // 切换语言
  const changeLanguage = async (languageCode: string) => {
    try {
      setIsLoading(true);
      
      // 设置后端语言偏好
      const response = await fetch('/api/language.php?action=set_language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language_code: languageCode }),
      });

      if (response.ok) {
        setCurrentLanguage(languageCode);
        await fetchTranslations(languageCode);
      } else {
        console.error('Failed to set language');
      }
    } catch (error) {
      console.error('Error changing language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 翻译函数
  const t = (key: string, fallback?: string): string => {
    return translations[key] || fallback || key;
  };

  // 初始化
  useEffect(() => {
    const initializeLanguage = async () => {
      await fetchLanguages();
      await fetchTranslations(currentLanguage);
      setIsLoading(false);
    };

    initializeLanguage();
  }, []);

  // 当语言改变时重新获取翻译
  useEffect(() => {
    if (currentLanguage && !isLoading) {
      fetchTranslations(currentLanguage);
    }
  }, [currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    availableLanguages,
    translations,
    isLoading,
    changeLanguage,
    t
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
