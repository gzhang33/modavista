import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { createLocalizedHref } from "@/utils/translationUtils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const { t } = useLanguage();
  const [location] = useLocation();

  // Auto-generate breadcrumb based on current location
  const generateBreadcrumb = (): BreadcrumbItem[] => {
    const path = location;
    
    if (path === '/') {
      return [{ label: t('nav.home', 'Home'), isActive: true }];
    }
    
    if (path === '/products') {
      return [
        { label: t('nav.home', 'Home'), href: '/' },
        { label: t('nav.products', 'Products'), isActive: true }
      ];
    }
    
    if (path.startsWith('/product/')) {
      return [
        { label: t('nav.home', 'Home'), href: '/' },
        { label: t('nav.products', 'Products'), href: '/products' },
        { label: t('product.detail', 'Product Detail'), isActive: true }
      ];
    }
    
    return [{ label: t('nav.home', 'Home'), isActive: true }];
  };

  const breadcrumbItems = items || generateBreadcrumb();

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
      <div className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            {index === 0 && (
              <Home size={16} className="text-gray-400" />
            )}
            {item.href ? (
              <a
                href={createLocalizedHref(item.href)}
                className="hover:text-accent-gold transition-colors duration-200"
              >
                {item.label}
              </a>
            ) : (
              <span className={item.isActive ? "text-charcoal font-medium" : "text-gray-600"}>
                {item.label}
              </span>
            )}
            {index < breadcrumbItems.length - 1 && (
              <ChevronRight size={16} className="text-gray-400" />
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
