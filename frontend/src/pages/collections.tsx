import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Grid, List, ChevronLeft } from "lucide-react";
import { Product } from "@shared/schemas/schema";
import { FilterState, FilterOption, LanguageState } from "@/types";
import { Link, useLocation } from "wouter";
import Header from "@/components/header-simple";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { fetchAllFilterOptions } from "@/lib/filter-options";
import { processImagePath, createImageErrorHandler } from "@/lib/image-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGE_TO_LOCALE } from "@/utils/translationUtils";

interface CollectionsPageProps {
  onOpenProductModal: (productId: string) => void;
}

export default function CollectionsPage({ onOpenProductModal }: CollectionsPageProps) {
  const { t, currentLanguage } = useLanguage();
  const currentLangShort = (currentLanguage || 'en').split('-')[0];
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    fabric: 'all',
    season: '3', // Default to "Tutte le stagioni" (All Season)
    style: 'all'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('most-popular');
  const [showFilters, setShowFilters] = useState(false);
  
  const [languageState, setLanguageState] = useState<LanguageState>({
    currentLanguage: 'en',
    availableLanguages: []
  });

  // Dynamic filter options state
  const [filterOptions, setFilterOptions] = useState<{
    categories: FilterOption[];
    materials: FilterOption[];
    colors: FilterOption[];
    seasons: FilterOption[];
    styles: FilterOption[];
  }>({
    categories: [],
    materials: [],
    colors: [],
    seasons: [],
    styles: []
  });


  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load dynamic filter options
  useEffect(() => {
    fetchAllFilterOptions(currentLangShort).then(options => {
      console.log('Loaded filter options:', options);
      setFilterOptions(options);
    }).catch(error => {
      console.error('Failed to load filter options:', error);
    });
  }, [currentLangShort]);

  // Parse URL parameters and set initial filters - wait for filterOptions to be loaded
  useEffect(() => {
    if (filterOptions.categories.length === 0) return; // Wait for filter options to load
    
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    
    console.log('URL category parameter:', categoryParam);
    console.log('Available filter options:', filterOptions.categories);
    
    if (categoryParam && categoryParam !== 'all') {
      const foundCategory = filterOptions.categories.find(cat =>
        (cat.id && cat.id.toLowerCase() === categoryParam.toLowerCase()) ||
        (cat.name && cat.name.toLowerCase() === categoryParam.toLowerCase()) ||
        (cat.english_name && cat.english_name.toLowerCase() === categoryParam.toLowerCase())
      );
      
      if (foundCategory) {
        console.log('Setting category filter to:', foundCategory.id);
        setFilters(prev => ({ ...prev, category: foundCategory.id }));
      } else {
        console.log('Category not found in filter options:', categoryParam);
      }
    }
  }, [location, filterOptions.categories]);

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products', currentLangShort],
    queryFn: async () => {
      const response = await fetch(`/api/products.php?lang=${currentLangShort}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      
      console.log('Fetched products data:', data);

      // Adapt product variant data to frontend Product interface
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category || t('products.uncategorized', 'Uncategorized'),
        fabric: item.material || t('products.cotton', 'Cotton'),
        style: t('products.casual', 'casual'), // 默认值
        season: item.season || t('products.all_season', 'all-season'),
        care: item.care || t('products.machine_wash', 'Machine wash'),
        origin: t('products.made_in_italy', 'Made in Italy'),
        sku: item.sku || '',
        images: item.media && item.media.length > 0
          ? item.media
          : (item.defaultImage ? [item.defaultImage] : []),
        specifications: {
          [t('products.material', 'Material')]: item.material || '',
          [t('products.color', 'Color')]: item.color || '',
          [t('products.sku', 'SKU')]: item.sku || ''
        },
        featured: t('products.no', 'no'),
        defaultImage: item.defaultImage,
        createdAt: item.createdAt,
        color: item.color,
        material: item.material
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Normalize a label to a translation key suffix
  const toKey = (label: string): string => {
    return (label || '')
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  };

  // Filter products based on current filters and search query
  const filteredProducts = products.filter(product => {
    // Category filter - support both category ID, name, and english_name matching
    if (filters.category !== 'all') {
      const selectedCategory = filterOptions.categories.find(cat => 
        cat.id === filters.category || 
        cat.name === filters.category ||
        cat.english_name === filters.category
      );
      const categoryName = selectedCategory ? selectedCategory.name : filters.category;
      const categoryEnglishName = selectedCategory ? selectedCategory.english_name : filters.category;
      
      const categoryMatch =
        product.category === categoryName ||
        product.category === filters.category ||
        (categoryEnglishName && product.category === categoryEnglishName) || // Added this line for english_name matching
        product.category?.toLowerCase().includes(categoryName.toLowerCase()) ||
        product.category?.toLowerCase().includes(filters.category.toLowerCase()) ||
        (categoryEnglishName && product.category?.toLowerCase().includes(categoryEnglishName.toLowerCase())); // Added this line for english_name matching

      if (!categoryMatch) {
        return false;
      }
    }

    // Fabric/Material filter - support Chinese material matching
    if (filters.fabric !== 'all' && product.material) {
      const fabricMatch = 
        product.material.toLowerCase().includes(filters.fabric.toLowerCase()) ||
        filterOptions.materials.find(mat => 
          mat.id === filters.fabric && 
          (mat.name === product.material || mat.label === product.material)
        );
      
      if (!fabricMatch) {
        return false;
      }
    }

    // Season filter - handle both season ID and season name matching
    if (filters.season !== '3') { // '3' is the default "All Seasons" option
      const selectedSeason = filterOptions.seasons.find(s => s.id === filters.season);
      const seasonName = selectedSeason ? selectedSeason.name : filters.season;
      
      const seasonMatch = 
        product.season === seasonName ||
        product.season === filters.season ||
        product.season?.toLowerCase().includes(seasonName.toLowerCase()) ||
        product.season?.toLowerCase().includes(filters.season.toLowerCase());
      
      if (!seasonMatch) {
        return false;
      }
    }

    // Style filter
    if (filters.style !== 'all' && product.style !== filters.style) {
      return false;
    }

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        (product.fabric && product.fabric.toLowerCase().includes(query)) ||
        (product.material && product.material.toLowerCase().includes(query)) ||
        (product.color && product.color.toLowerCase().includes(query)) ||
        product.category.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    console.log('Updating filters:', newFilters);
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      console.log('New filter state:', updated);
      return updated;
    });
  };

  console.log('Products loaded:', products.length, 'Filtered:', filteredProducts.length);
  console.log('Current filters:', filters);
  console.log('Filter options:', filterOptions);

  const clearFilters = () => {
    setFilters({
      category: 'all',
      fabric: 'all',
      season: '3', // Default to "Tutte le stagioni" (All Season)
      style: 'all'
    });
    setSearchQuery('');
    setPriceRange([0, 1000]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            {/* Sidebar Skeleton */}
            <div className="w-80 pr-8">
              <div className="space-y-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Main Content Skeleton */}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <Skeleton className="w-full h-80 rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-semibold text-charcoal mb-4">{t('errors.general.title', 'Error')}</h1>
            <p className="text-xl text-red-500">{t('errors.products.load_failed', 'Failed to load products. Please refresh the page.')}</p>
            <p className="text-text-grey mt-2">{t('errors.general.message', 'An unexpected error occurred. Please try again.')}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-charcoal text-white hover:bg-gray-800"
            >
              {t('common.retry', 'Try Again')}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title={t('products.seo_title', 'DreaModa Products - Premium Wholesale Garments Collection')}
        description={t('products.seo_description', 'Explore our complete collection of premium Italian fashion garments. Wholesale clothing, dresses, tops, outerwear and accessories for discerning fashion retailers.')}
        canonicalPath="/collections"
      />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              className="text-text-grey hover:text-charcoal p-0"
              data-testid="link-back-home"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t('products.back_to_home', 'Back to Home')}
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-playfair font-semibold text-charcoal mb-4">
            {t('products.title', 'All Collections')}
          </h1>
        </div>

        {/* Mobile Search and Filter Bar - Only visible on mobile */}
        <div className="mb-6 md:hidden">
          <div className="flex gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={t('products.search_placeholder', 'Search products...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-gold focus:border-transparent"
                data-testid="input-product-search"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Filter Button */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300 flex-shrink-0"
              data-testid="button-filter-toggle"
            >
              {t('products.filters_title', 'Filter')}
            </Button>
          </div>
        </div>

        {/* Mobile Collapsible Filters - Only visible on mobile */}
        {showFilters && (
          <div className="mb-6 bg-soft-white rounded-lg p-6 md:hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-charcoal">{t('products.filters_title', 'Filters')}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-text-grey hover:text-charcoal"
                data-testid="button-clear-filters"
              >
                {t('products.clear_all', 'Clear All')}
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Categories */}
              <div>
                <label className="text-sm font-medium text-charcoal mb-3 block">{t('products.category', 'Category')}</label>
                <div className="space-y-2">
                  {filterOptions.categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={category.id}
                        checked={filters.category === category.id}
                        onCheckedChange={() => updateFilters({ category: category.id })}
                        data-testid={`checkbox-category-${category.id}`}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm text-text-grey cursor-pointer"
                      >
                        {category.id === 'all' ? t('filters.all_categories', 'All Categories') : category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fabric/Material */}
              <div>
                <label className="text-sm font-medium text-charcoal mb-3 block">{t('products.material', 'Material')}</label>
                <div className="space-y-2">
                  {filterOptions.materials.map((material) => (
                    <div key={material.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={material.id}
                        checked={filters.fabric === material.id}
                        onCheckedChange={() => updateFilters({ fabric: material.id })}
                        data-testid={`checkbox-fabric-${material.id}`}
                      />
                      <label
                        htmlFor={material.id}
                        className="text-sm text-text-grey cursor-pointer"
                      >
                        {material.id === 'all' ? t('products.all_materials', 'All Materials') : material.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div>
                <label className="text-sm font-medium text-charcoal mb-3 block">{t('products.season', 'Season')}</label>
                <div className="space-y-2">
                  {filterOptions.seasons.map((season) => (
                    <div key={season.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={season.id}
                        checked={filters.season === season.id}
                        onCheckedChange={() => updateFilters({ season: season.id })}
                        data-testid={`checkbox-season-${season.id}`}
                      />
                      <label
                        htmlFor={season.id}
                        className="text-sm text-text-grey cursor-pointer"
                      >
                        {season.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            {/* Show Collections Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowFilters(false); // Hide the filters panel
                  // Filters are already applied in real-time, no additional action needed
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
                data-testid="button-show-collections-mobile"
              >
                {t('products.show_collections', 'Show Collections')}
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters - Only visible on desktop */}
          <div className="hidden md:block w-full lg:w-80 flex-shrink-0">
            <div className="bg-soft-white rounded-lg p-4 lg:p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-charcoal">{t('products.filters_title', 'Filters')}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-text-grey hover:text-charcoal"
                  data-testid="button-clear-filters"
                >
                  {t('products.clear_all', 'Clear All')}
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-2 block">{t('products.search_label', 'Search')}</label>
                <Input
                  type="text"
                  placeholder={t('products.search_placeholder', 'Search products...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  data-testid="input-product-search"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">{t('products.category', 'Category')}</label>
                <div className="space-y-2">
                  {filterOptions.categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={category.id}
                        checked={filters.category === category.id}
                        onCheckedChange={() => updateFilters({ category: category.id })}
                        data-testid={`checkbox-category-${category.id}`}
                      />
                      <label
                        htmlFor={category.id}
                        className="text-sm text-text-grey cursor-pointer"
                      >
                        {category.id === 'all' ? t('filters.all_categories', 'All Categories') : category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fabric/Material */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">{t('products.material', 'Material')}</label>
                <div className="space-y-2">
                  {filterOptions.materials.map((material) => (
                    <div key={material.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={material.id}
                        checked={filters.fabric === material.id}
                        onCheckedChange={() => updateFilters({ fabric: material.id })}
                        data-testid={`checkbox-fabric-${material.id}`}
                      />
                      <label
                        htmlFor={material.id}
                        className="text-sm text-text-grey cursor-pointer"
                      >
                        {material.id === 'all' ? t('products.all_materials', 'All Materials') : material.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">{t('products.season', 'Season')}</label>
                <div className="space-y-2">
                  {filterOptions.seasons.map((season) => (
                    <div key={season.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={season.id}
                        checked={filters.season === season.id}
                        onCheckedChange={() => updateFilters({ season: season.id })}
                        data-testid={`checkbox-season-${season.id}`}
                      />
                      <label
                        htmlFor={season.id}
                        className="text-sm text-text-grey cursor-pointer"
                      >
                        {season.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200 gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-grey">
                  {(
                    t('products.results_count', '{count} products')
                  ).replace('{count}', String(filteredProducts.length))}
                </span>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48" data-testid="select-sort">
                    <SelectValue placeholder={t('products.sort_by', 'Sort by')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-popular">{t('products.sort_most_popular', 'Most Popular')}</SelectItem>
                    <SelectItem value="name-asc">{t('products.sort_name_asc', 'Name A-Z')}</SelectItem>
                    <SelectItem value="name-desc">{t('products.sort_name_desc', 'Name Z-A')}</SelectItem>
                    <SelectItem value="newest">{t('products.sort_newest', 'Newest First')}</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex border border-gray-300 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="border-0 rounded-r-none"
                    data-testid="button-grid-view"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="border-0 rounded-l-none"
                    data-testid="button-list-view"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-text-grey">
                  {products.length === 0 
                    ? t('products.empty.no_products', 'No products available. Please add some products from the admin panel.')
                    : t('products.empty.no_match', 'No products found matching your criteria.')}
                </p>
                {products.length === 0 ? (
                  <p className="text-text-grey mt-2">{t('products.empty.visit_admin', 'Visit the admin panel to add your first product.')}</p>
                ) : (
                  <p className="text-text-grey mt-2">{t('products.empty.try_adjust', 'Try adjusting your filters or search terms.')}</p>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 sm:gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`group cursor-pointer border-none shadow-none bg-transparent hover:shadow-lg transition-shadow duration-300 ${
                      viewMode === 'list' ? 'flex flex-row' : ''
                    }`}
                    onClick={() => setLocation(`/product/${product.id}`)}
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className={`relative overflow-hidden rounded-lg ${
                      viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'mb-4'
                    }`}>
                      <img
                        src={processImagePath(
                          product.images && product.images[0]
                            ? product.images[0]
                            : product.defaultImage,
                          { debug: true } // Enable debug mode
                        )}
                        alt={product.name}
                        className={`object-contain group-hover:scale-105 transition-transform duration-500 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-80'
                        }`}
                        onError={createImageErrorHandler({ debug: true, t })} // Enable debug mode with translation
                      />

                      {/* 网格视图的产品名称 - 无背景渐变 */}
                      {viewMode !== 'list' && (
                        <div className="mt-4">
                          <h4 className="text-lg font-playfair font-semibold text-charcoal text-center">
                            {product.name}
                          </h4>
                        </div>
                      )}

                      <Badge className="absolute top-4 right-4 bg-accent-gold text-charcoal">
                        {t('common.badges.new', 'New')}
                      </Badge>
                    </div>

                    {/* 列表视图的产品名称 */}
                    {viewMode === 'list' && (
                      <div className="flex-1 p-4">
                        <h4 className="text-xl font-playfair font-semibold text-charcoal mb-2">
                          {product.name}
                        </h4>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

