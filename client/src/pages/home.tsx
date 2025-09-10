import Header from "@/components/header-simple";
import HeroSection from "@/components/hero-section";
import CategoryCarousel from "@/components/category-carousel";
import FeaturedCollection from "@/components/featured-collection";
import CompanyInfo from "@/components/company-info";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { useState, useEffect } from "react";
import { FilterState } from "@/types";
import { useLocation } from "wouter";
import { handleHashOnLoad } from "@/utils/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

interface HomeProps {}

export default function Home({}: HomeProps) {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    fabric: 'all',
    season: 'all',
    style: 'all'
  });

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle hash-based navigation for anchor links
  useEffect(() => {
    handleHashOnLoad();
  }, []);

  const handleNavigateToCategory = (category: string) => {
    setLocation(`/products?category=${category}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEOHead />
      <Header />
      
      <HeroSection />
      
      <CategoryCarousel onNavigateToCategory={handleNavigateToCategory} />
      
      <FeaturedCollection 
        filters={filters}
      />
      
      <CompanyInfo />
      
      <ContactSection />
      
      <Footer />
    </div>
  );
}