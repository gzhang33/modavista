import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/language-switcher";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { navigateToSection } from "@/utils/navigation";
import { createLocalizedHref } from "@/utils/translationUtils";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const [location] = useLocation();

  const goTo = (sectionId: string) => {
    navigateToSection(sectionId, location);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-playfair font-bold text-charcoal">
              DreaModa
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href={createLocalizedHref('/#hero')}
              onClick={(e) => { e.preventDefault(); goTo('hero'); }}
              className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
            >
              {t('nav.home', 'Home')}
            </a>
            <a
              href={createLocalizedHref('/#collections')}
              onClick={(e) => { e.preventDefault(); goTo('collections'); }}
              className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
            >
              {t('nav.collections', 'Collections')}
            </a>
            <a
              href={createLocalizedHref('/#about')}
              onClick={(e) => { e.preventDefault(); goTo('about'); }}
              className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
            >
              {t('nav.about', 'About')}
            </a>
            <a
              href={createLocalizedHref('/#contact')}
              onClick={(e) => { e.preventDefault(); goTo('contact'); }}
              className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
            >
              {t('nav.contact', 'Contact')}
            </a>
          </nav>

          {/* Desktop Language Switcher */}
          <div className="hidden md:flex items-center">
            <LanguageSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-accent-gold transition-colors duration-300"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <a
                href={createLocalizedHref('/#hero')}
                className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
                onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); goTo('hero'); }}
              >
                {t('nav.home', 'Home')}
              </a>
              <a
                href={createLocalizedHref('/#collections')}
                className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
                onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); goTo('collections'); }}
              >
                {t('nav.collections', 'Collections')}
              </a>
              <a
                href={createLocalizedHref('/#about')}
                className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
                onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); goTo('about'); }}
              >
                {t('nav.about', 'About')}
              </a>
              <a
                href={createLocalizedHref('/#contact')}
                className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
                onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); goTo('contact'); }}
              >
                {t('nav.contact', 'Contact')}
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}