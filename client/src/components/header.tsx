import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu } from "lucide-react";
import { SearchState } from "@/types";

interface HeaderProps {
  searchState: SearchState;
  onToggleSearch: () => void;
  onUpdateSearchQuery: (query: string) => void;
}

export default function Header({ searchState, onToggleSearch, onUpdateSearchQuery }: HeaderProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-playfair font-semibold text-charcoal tracking-wide">
                DREAMODA
              </h1>
              <span className="ml-3 text-sm text-accent-gold font-medium">FASHION</span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              
              <button
                onClick={() => scrollToSection('categories')}
                className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
                data-testid="nav-categories"
              >
                Categories
              </button>

              <button
                onClick={() => scrollToSection('collections')}
                className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
                data-testid="nav-collections"
              >
                Collections
              </button>

              <button
                onClick={() => scrollToSection('about')}
                className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
                data-testid="nav-about"
              >
                About
              </button>
              
              <button
                onClick={() => scrollToSection('contact')}
                className="text-charcoal hover:text-accent-gold transition-colors duration-300 font-medium"
                data-testid="nav-contact"
              >
                Contact
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSearch}
                className="text-charcoal hover:text-accent-gold transition-colors"
                data-testid="button-search"
              >
                <Search className="text-lg" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden text-charcoal hover:text-accent-gold transition-colors"
                data-testid="button-mobile-menu"
              >
                <Menu className="text-lg" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {searchState.isOpen && (
        <div className="bg-soft-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search garments, styles, fabrics..."
                value={searchState.query}
                onChange={(e) => onUpdateSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                data-testid="input-search"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-grey hover:text-accent-gold"
                data-testid="button-search-submit"
              >
                <Search />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
