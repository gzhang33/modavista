import Header from "@/components/header-simple";
import HeroSection from "@/components/hero-section";
import CategoryCarousel from "@/components/category-carousel";
import FeaturedCollection from "@/components/featured-collection";
import CompanyInfo from "@/components/company-info";
import PartnersSection from "@/components/partners-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { useState, useEffect } from "react";
import { FilterState } from "@/types";
import { useLocation } from "wouter";
import { handleHashOnLoad } from "@/utils/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/utils/structuredData";
import { IMAGE_PATHS } from "@/lib/image-config";

interface HomeProps {}

export default function Home({}: HomeProps) {
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    fabric: 'all',
    season: 'all',
    style: 'all',
    color: 'all'
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
    setLocation(`/collections?category=${category}`);
  };

  // 生成结构化数据
  const organizationData = {
    name: "DreamModa",
    url: typeof window !== 'undefined' ? window.location.origin : 'https://dreamoda.store',
    logo: `${typeof window !== 'undefined' ? window.location.origin : 'https://dreamoda.store'}${IMAGE_PATHS.DREAMODA_LOGO}`,
    description: t('seo.description'),
    address: {
      streetAddress: "Via Gherardacci 47/C, Iolo",
      addressLocality: "Prato",
      addressRegion: "Tuscany",
      postalCode: "59100",
      addressCountry: "IT"
    },
    contactPoint: {
      telephone: "+39 02 1234 5678",
      contactType: "Business Inquiries",
      email: "Hi@DreamModa.store"
    },
    sameAs: [
      "https://www.instagram.com/dreamoda",
      "https://www.facebook.com/dreamoda",
      "https://www.linkedin.com/company/dreamoda"
    ]
  };

  const structuredData = [
    generateOrganizationSchema(organizationData),
    generateWebSiteSchema(typeof window !== 'undefined' ? window.location.origin : 'https://dreamoda.store')
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        structuredData={structuredData}
        type="website"
      />
      <Header />
      
      <HeroSection />
      
      <CategoryCarousel onNavigateToCategory={handleNavigateToCategory} />
      
      <FeaturedCollection 
        filters={filters}
      />
      
      <CompanyInfo />
      
      <PartnersSection />
      
      <ContactSection />
      
      <Footer />
    </div>
  );
}