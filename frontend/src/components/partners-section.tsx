import { useLanguage } from "@/contexts/LanguageContext";

// European countries data with flag images and names
const mainstreamCountries = [
  { name: "Italy", flag: "/storage/uploads/flags/italy.svg", alt: "Italy" },
  { name: "France", flag: "/storage/uploads/flags/france.svg", alt: "France" },
  { name: "Spain", flag: "/storage/uploads/flags/spain.svg", alt: "Spain" },
  { name: "United Kingdom", flag: "/storage/uploads/flags/uk.svg", alt: "United Kingdom" },
  { name: "Germany", flag: "/storage/uploads/flags/germany.svg", alt: "Germany" }
];

const otherCountries = [
  { name: "Austria", flag: "/storage/uploads/flags/austria.svg", alt: "Austria" },
  { name: "Netherlands", flag: "/storage/uploads/flags/netherlands.svg", alt: "Netherlands" },
  { name: "Belgium", flag: "/storage/uploads/flags/belgium.svg", alt: "Belgium" },
  { name: "Switzerland", flag: "/storage/uploads/flags/switzerland.svg", alt: "Switzerland" }
];

export default function PartnersSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-playfair font-semibold text-charcoal mb-4">
            {t('home.partners.title')}
          </h2>
          <p className="text-lg text-text-grey max-w-2xl mx-auto">
            {t('home.partners.subtitle')}
          </p>
        </div>

        {/* Two-row Logo Scroller */}
        <div className="max-w-6xl mx-auto space-y-6">
          {/* First row - Mainstream countries (scroll right) */}
          <div className="logo-scroller">
            <div className="logo-scroller-inner scroll-right">
              {/* Multiple sets for seamless infinite scrolling */}
              {[...Array(4)].map((_, setIndex) => 
                mainstreamCountries.map((country, index) => (
                  <div key={`mainstream-${setIndex}-${index}`} className="flex items-center gap-3 px-4">
                    <img
                      src={country.flag}
                      alt={country.alt}
                      className="h-8 w-auto object-contain"
                    />
                    <span className="text-sm font-medium text-text-grey whitespace-nowrap">
                      {country.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Second row - Other countries (scroll left) */}
          <div className="logo-scroller">
            <div className="logo-scroller-inner scroll-left">
              {/* Multiple sets for seamless infinite scrolling */}
              {[...Array(4)].map((_, setIndex) => 
                otherCountries.map((country, index) => (
                  <div key={`other-${setIndex}-${index}`} className="flex items-center gap-3 px-4">
                    <img
                      src={country.flag}
                      alt={country.alt}
                      className="h-8 w-auto object-contain"
                    />
                    <span className="text-sm font-medium text-text-grey whitespace-nowrap">
                      {country.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .logo-scroller {
          overflow: hidden;
          -webkit-mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
          mask: linear-gradient(90deg, transparent, white 20%, white 80%, transparent);
        }

        .logo-scroller-inner {
          display: flex;
          gap: 20px;
          padding-block: 10px;
          width: max-content;
        }

        .scroll-right {
          animation: scrollRight 30s linear infinite;
        }

        .scroll-left {
          animation: scrollLeft 30s linear infinite;
        }

        .logo-scroller-inner img {
          filter: grayscale(0%);
          opacity: 0.8;
          transition: all 0.3s ease;
        }

        .logo-scroller-inner:hover img {
          filter: grayscale(0%);
          opacity: 1;
        }

        @keyframes scrollRight {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </section>
  );
}
