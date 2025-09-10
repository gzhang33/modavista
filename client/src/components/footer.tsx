import { Link, useLocation } from "wouter";
import { navigateToSection } from "@/utils/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { createLocalizedHref } from "@/utils/translationUtils";

export default function Footer() {
  const [location] = useLocation();
  const { t } = useLanguage();

  const scrollToSection = (sectionId: string) => {
    navigateToSection(sectionId, location);
  };

  // 生成多语言产品页面链接
  const productsHref = createLocalizedHref('/products');

  return (
    <footer className="bg-charcoal text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h5 className="text-2xl font-playfair font-semibold mb-4">DREAMODA</h5>
            <p className="text-gray-300 mb-4 max-w-md">
              {t('footer.description', 'Premium fashion manufacturer and designer, creating exceptional garments for discerning customers worldwide with Italian craftsmanship and modern style.')}
            </p>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4">{t('footer.quick_links', 'Quick Links')}</h6>
            <ul className="space-y-2 text-gray-300">
              <li>
                <Link href={productsHref}>
                  <span className="hover:text-accent-gold transition-colors cursor-pointer"
                        data-testid="footer-products">
                    {t('footer.all_products', 'All Products')}
                  </span>
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('collections')}
                  className="hover:text-accent-gold transition-colors text-left"
                  data-testid="footer-collections"
                >
                  {t('footer.collections', 'Collections')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('categories')}
                  className="hover:text-accent-gold transition-colors text-left"
                  data-testid="footer-categories"
                >
                  {t('footer.categories', 'Categories')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="hover:text-accent-gold transition-colors text-left"
                  data-testid="footer-about"
                >
                  {t('footer.about_us', 'About Us')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-accent-gold transition-colors text-left"
                  data-testid="footer-contact"
                >
                  {t('footer.contact', 'Contact')}
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>{t('footer.copyright', '© 2025 DREAMODA. All rights reserved. | Made with passion for fashion in Milano, Italia.')}</p>
        </div>
      </div>
    </footer>
  );
}
