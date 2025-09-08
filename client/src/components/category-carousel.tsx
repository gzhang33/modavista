import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";

interface CategoryCarouselProps {
  onNavigateToCategory?: (category: string) => void;
}

const categories = [
  {
    id: 'Tops',
    name: 'TOPS',
    image: '/images/categories/tops.jpg'
  },
  {
    id: 'Outerwear',
    name: 'OUTERWEAR',
    image: '/images/categories/outerwear.jpg'
  },
  {
    id: 'Bottoms',
    name: 'BOTTOMS',
    image: '/images/categories/bottoms.jpg'
  },
  {
    id: 'Dresses',
    name: 'DRESSES',
    image: '/images/categories/dresses.jpg'
  }
];

export default function CategoryCarousel({ onNavigateToCategory }: CategoryCarouselProps) {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout>();

  const handleCategoryClick = (categoryId: string) => {
    if (onNavigateToCategory) {
      onNavigateToCategory(categoryId);
    } else {
      setLocation(`/products?category=${categoryId}`);
    }
  };

  const scrollTo = (index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = 320; // Card width + gap
      container.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
    }
  };

  const scrollLeft = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : categories.length - 1;
    scrollTo(newIndex);
    setIsAutoScrolling(false);
  };

  const scrollRight = () => {
    const newIndex = currentIndex < categories.length - 1 ? currentIndex + 1 : 0;
    scrollTo(newIndex);
    setIsAutoScrolling(false);
  };

  // Auto scroll functionality
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev < categories.length - 1 ? prev + 1 : 0;
          scrollTo(nextIndex);
          return nextIndex;
        });
      }, 4000);
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, currentIndex]);

  const handleMouseEnter = () => {
    setIsAutoScrolling(false);
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsAutoScrolling(true);
  };

  return (
    <section className="py-16 bg-white" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-playfair font-semibold text-charcoal mb-4">
            Shop Garments by Category
          </h3>
          <p className="text-xl text-text-grey max-w-2xl mx-auto">
            Explore our diverse collection of premium fashion garments across different categories
          </p>
        </div>

        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full w-12 h-12 p-0"
            data-testid="button-scroll-left"
          >
            <ChevronLeft className="h-6 w-6 text-charcoal" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow-lg rounded-full w-12 h-12 p-0"
            data-testid="button-scroll-right"
          >
            <ChevronRight className="h-6 w-6 text-charcoal" />
          </Button>

          {/* Scrolling Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((category, index) => (
              <div
                key={`${category.id}-${index}`}
                className="flex-shrink-0 w-80 cursor-pointer group"
                onClick={() => handleCategoryClick(category.id)}
                data-testid={`category-card-${category.id}`}
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg h-64 group-hover:scale-110 transition-transform duration-500 bg-gray-200">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                  
                  {/* Category Name Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/90 to-transparent p-6">
                    <h4 className="text-white text-xl font-playfair font-semibold text-center tracking-wider mb-2">
                      {category.name}
                    </h4>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {categories.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  scrollTo(index);
                  setIsAutoScrolling(false);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-accent-gold' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                data-testid={`dot-indicator-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}