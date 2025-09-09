import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { navigateToSection } from "@/utils/navigation";

export default function HeroSection() {
  const [location] = useLocation();
  
  const scrollToSection = (sectionId: string) => {
    navigateToSection(sectionId, location);
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/index_background.png')"
        }}
      />
      {/* Add soft dark overlay to make text more readable */}
      <div className="absolute inset-0 bg-black bg-opacity-30" />
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        {/* Add text shadow to enhance readability */}
        <h2 className="text-5xl md:text-7xl font-playfair font-bold mb-6 leading-tight drop-shadow-lg">
          Premium Wholesale
          <br />
          <span className="text-accent-gold drop-shadow-lg">Garment Collection</span>
        </h2>
        <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-md">
          Discover our curated selection of high-quality garments crafted for discerning wholesale partners
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => scrollToSection('collections')}
            className="bg-accent-gold text-charcoal px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors duration-300"
            data-testid="button-explore-collections"
          >
            Explore Collections
          </Button>
          <Button
            onClick={() => scrollToSection('contact')}
            variant="outline"
            className="border-2 border-white text-white bg-transparent px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-charcoal transition-all duration-300"
            data-testid="button-request-samples"
          >
            Request Samples
          </Button>
        </div>
      </div>
    </section>
  );
}
