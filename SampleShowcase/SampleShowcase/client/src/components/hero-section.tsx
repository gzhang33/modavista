import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')"
        }}
      />
      <div className="absolute inset-0 bg-charcoal bg-opacity-40" />
      
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h2 className="text-5xl md:text-7xl font-playfair font-bold mb-6 leading-tight">
          Premium Wholesale
          <br />
          <span className="text-accent-gold">Garment Collection</span>
        </h2>
        <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto leading-relaxed">
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
            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-charcoal transition-all duration-300"
            data-testid="button-request-samples"
          >
            Request Samples
          </Button>
        </div>
      </div>
    </section>
  );
}
