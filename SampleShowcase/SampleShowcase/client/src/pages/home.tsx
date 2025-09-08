import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import CategoryCarousel from "@/components/category-carousel";
import CompanyInfo from "@/components/company-info";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import { useState } from "react";
import { SearchState } from "@/types";
import { useLocation } from "wouter";

interface HomeProps {
  onOpenProductModal?: (productId: string) => void;
}

export default function Home({ onOpenProductModal = () => {} }: HomeProps) {
  const [, setLocation] = useLocation();
  const [searchState, setSearchState] = useState<SearchState>({
    isOpen: false,
    query: ""
  });

  const toggleSearch = () => {
    setSearchState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const updateSearchQuery = (query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  };

  const handleNavigateToCategory = (category: string) => {
    setLocation(`/products?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        searchState={searchState}
        onToggleSearch={toggleSearch}
        onUpdateSearchQuery={updateSearchQuery}
      />
      
      <HeroSection />
      
      <CategoryCarousel onNavigateToCategory={handleNavigateToCategory} />
      
      <CompanyInfo />
      
      <ContactSection />
      
      <Footer />
    </div>
  );
}
