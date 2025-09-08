import { Linkedin, Instagram, Facebook } from "lucide-react";

export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-charcoal text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h5 className="text-2xl font-playfair font-semibold mb-4">ATELIER TEXTILE</h5>
            <p className="text-gray-300 mb-4 max-w-md">
              Premium wholesale garment manufacturer serving fashion brands and retailers worldwide 
              with exceptional quality and craftsmanship since 1985.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-300 hover:text-accent-gold transition-colors"
                data-testid="link-linkedin"
              >
                <Linkedin className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-accent-gold transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="text-xl" />
              </a>
              <a
                href="#"
                className="text-gray-300 hover:text-accent-gold transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="text-xl" />
              </a>
            </div>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4">Quick Links</h6>
            <ul className="space-y-2 text-gray-300">
              <li>
                <button
                  onClick={() => scrollToSection('collections')}
                  className="hover:text-accent-gold transition-colors text-left"
                  data-testid="footer-collections"
                >
                  Collections
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('categories')}
                  className="hover:text-accent-gold transition-colors text-left"
                  data-testid="footer-categories"
                >
                  Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="hover:text-accent-gold transition-colors text-left"
                  data-testid="footer-about"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-accent-gold transition-colors text-left"
                  data-testid="footer-contact"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4">Services</h6>
            <ul className="space-y-2 text-gray-300">
              <li>Wholesale Manufacturing</li>
              <li>Custom Design Services</li>
              <li>Sample Development</li>
              <li>Quality Assurance</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 ATELIER TEXTILE. All rights reserved. | Wholesale inquiries only - No retail sales.</p>
        </div>
      </div>
    </footer>
  );
}
