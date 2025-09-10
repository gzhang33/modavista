import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Category } from "@/types";

interface CategoryCarouselProps {
  onNavigateToCategory?: (category: string) => void;
}

export default function CategoryCarousel({ onNavigateToCategory }: CategoryCarouselProps) {
  const [, setLocation] = useLocation();
  const { currentLanguage } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); // Initial index will be set after categories load
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/categories.php?lang=${currentLanguage}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: { id: string; name: string; english_name: string }[] = await response.json();
        const mappedCategories: Category[] = data.map(item => ({
          id: item.id,
          name: item.name.toUpperCase(),
          image: `/images/categories/${item.english_name.toLowerCase()}.jpg`,
          english_name: item.english_name
        }));
        setCategories(mappedCategories);
        setCurrentIndex(mappedCategories.length); // Set initial index for infinite scroll
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Fallback to a default set of categories if API fails
        setCategories([
          { id: 'Tops', name: 'TOPS', image: '/client/public/images/categories/tops.jpg' },
          { id: 'Outerwear', name: 'OUTERWEAR', image: '/client/public/images/categories/outerwear.jpg' },
          { id: 'Bottoms', name: 'BOTTOMS', image: '/client/public/images/categories/bottoms.jpg' },
          { id: 'Dresses', name: 'DRESSES', image: '/client/public/images/categories/dresses.jpg' }
        ]);
        setCurrentIndex(4); // Reset index for fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [currentLanguage]);

  // Create 3 sets of repeated data for infinite loop, only after categories are loaded
  const extendedCategories = categories.length > 0 ? [...categories, ...categories, ...categories] : [];

  // Ensure currentIndex is valid when categories change
  useEffect(() => {
    if (categories.length > 0 && currentIndex === 0) {
      setCurrentIndex(categories.length);
    }
  }, [categories, currentIndex]);


  const handleCategoryClick = (categoryId: string) => {
    if (onNavigateToCategory) {
      onNavigateToCategory(categoryId);
    } else {
      setLocation(`/products?category=${categoryId}`);
    }
  };

  // 获取实际分类索引（用于dots显示）
  const getActualIndex = (index: number) => index % categories.length;

  // 检查并重置位置实现真正的持续向右滚动
  const checkAndResetPosition = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      
      // 当滚动到第三组的第一个项目时，进行无缝重置
      if (index >= categories.length * 2) {
        const newIndex = categories.length + (index % categories.length);
        
        // 临时禁用平滑滚动以实现瞬时跳转
        container.style.scrollBehavior = 'auto';
        
        // 计算并执行跳转
        const cardElement = container.querySelector('.category-card') as HTMLElement;
        if (cardElement) {
          const cardWidth = cardElement.offsetWidth;
          const gap = 24;
          const totalCardWidth = cardWidth + gap;
          const containerWidth = container.clientWidth;
          const targetCardCenter = newIndex * totalCardWidth + cardWidth / 2;
          const containerCenter = containerWidth / 2;
          const scrollLeft = targetCardCenter - containerCenter;
          
          container.scrollLeft = scrollLeft;
          setCurrentIndex(newIndex);
        }
        
        // 在下一帧重新启用平滑滚动，让后续滚动是平滑的
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.style.scrollBehavior = 'smooth';
          }
        }, 50);
      }
    }
  }, [categories.length]);

  const scrollToCenter = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      
      // 动态获取卡片实际宽度
      const cardElement = container.querySelector('.category-card') as HTMLElement;
      if (!cardElement) return;
      
      const cardWidth = cardElement.offsetWidth;
      const gap = 24; // gap-6 in Tailwind = 24px
      const totalCardWidth = cardWidth + gap;
      const containerWidth = container.clientWidth;
      
      // 计算目标卡片的中心位置
      const targetCardCenter = index * totalCardWidth + cardWidth / 2;
      
      // 计算容器中心位置
      const containerCenter = containerWidth / 2;
      
      // 计算需要滚动的距离（让目标卡片居中）
      const scrollLeft = targetCardCenter - containerCenter;
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
      setCurrentIndex(index);
      
      // 滚动完成后检查是否需要无缝跳转
      setTimeout(() => {
        checkAndResetPosition(index);
      }, 600); // 等待滚动动画完成
    }
  }, [checkAndResetPosition]);

  const scrollLeft = () => {
    const newIndex = currentIndex - 1;
    // 允许手动向左滚动到第一组，不进行边界限制
    scrollToCenter(newIndex);
    setIsAutoScrolling(false);
  };

  const scrollRight = () => {
    const newIndex = currentIndex + 1;
    // 向右滚动无限制，通过checkAndResetPosition处理无缝循环
    scrollToCenter(newIndex);
    setIsAutoScrolling(false);
  };

  // Auto scroll functionality
  useEffect(() => {
    if (isAutoScrolling) {
      autoScrollRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const nextIndex = prev + 1;
          scrollToCenter(nextIndex);
          return nextIndex;
        });
      }, 4000);
    }

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [isAutoScrolling, scrollToCenter]); // 移除currentIndex依赖

  // Handle window resize to recenter current item
  useEffect(() => {
    const handleResize = () => {
      // 延迟执行，确保DOM已更新
      setTimeout(() => {
        scrollToCenter(currentIndex);
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // 初始居中（从中间组第一个开始）
    setTimeout(() => {
      scrollToCenter(currentIndex);
    }, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [currentIndex, scrollToCenter]);

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
            {extendedCategories.map((category, index) => (
              <div
                key={`${category.id}-${index}`}
                className="flex-shrink-0 w-80 cursor-pointer group category-card"
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
                  // 找到最近的对应位置（中间组）
                  const targetIndex = categories.length + index;
                  scrollToCenter(targetIndex);
                  setIsAutoScrolling(false);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === getActualIndex(currentIndex)
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