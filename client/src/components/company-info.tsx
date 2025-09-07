export default function CompanyInfo() {
  return (
    <section className="bg-soft-white py-16" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-4xl font-playfair font-semibold text-charcoal mb-6">
              Crafting Dreams Into Fashion
            </h3>
            <p className="text-lg text-text-grey mb-6 leading-relaxed">
              DreaModa represents the perfect fusion of Italian fashion heritage and contemporary design. 
              Our atelier combines traditional craftsmanship with innovative techniques to create 
              exceptional garments that embody elegance, quality, and modern sophistication.
            </p>
            <p className="text-lg text-text-grey mb-8 leading-relaxed">
              Based in the heart of Milano, we specialize in creating unique pieces that reflect 
              individual style and personality. Our commitment to excellence and attention to detail 
              ensures that each creation meets the highest standards of Italian fashion tradition.
            </p>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-playfair font-bold text-accent-gold mb-2" data-testid="stat-garment-styles">
                  200+
                </div>
                <div className="text-text-grey">Fashion Designs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-playfair font-bold text-accent-gold mb-2" data-testid="stat-global-partners">
                  15+
                </div>
                <div className="text-text-grey">Years Experience</div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Modern textile manufacturing facility"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
