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
import { Grid3X3, List, ChevronLeft } from "lucide-react";
import { Product } from "@shared/schema";
import { FilterState, FilterOption, SearchState } from "@/types";
import { Link, useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { fetchAllFilterOptions } from "@/lib/filter-options";
import { processImagePath, createImageErrorHandler } from "@/lib/image-utils";

interface ProductsPageProps {
  onOpenProductModal: (productId: string) => void;
}

export default function ProductsPage({ onOpenProductModal }: ProductsPageProps) {
  const [location, setLocation] = useLocation();
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    fabric: 'all',
    season: 'all',
    style: 'all'
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('most-popular');
  
  const [searchState, setSearchState] = useState<SearchState>({
    isOpen: false,
    query: ""
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

  const toggleSearch = () => {
    setSearchState(prev => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const updateSearchQuery = (query: string) => {
    setSearchState(prev => ({ ...prev, query }));
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load dynamic filter options
  useEffect(() => {
    fetchAllFilterOptions().then(options => {
      console.log('Loaded filter options:', options);
      setFilterOptions(options);
    }).catch(error => {
      console.error('Failed to load filter options:', error);
    });
  }, []);

  // Parse URL parameters and set initial filters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const categoryParam = urlParams.get('category');
    
    if (categoryParam && categoryParam !== 'all') {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [location]);

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products.php?lang=en');
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
        category: item.category || 'Uncategorized',
        fabric: item.material || 'Cotton',
        style: 'casual', // 默认值
        season: 'all-season', // 默认值
        care: 'Machine wash',
        origin: 'Made in China',
        sku: item.sku || '',
        images: item.media && item.media.length > 0
          ? item.media
          : (item.defaultImage ? [item.defaultImage] : []),
        specifications: {
          'Material': item.material || '',
          'Color': item.color || '',
          'SKU': item.sku || ''
        },
        featured: 'no',
        defaultImage: item.defaultImage,
        createdAt: item.createdAt,
        color: item.color,
        material: item.material
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  // Filter products based on current filters and search query
  const filteredProducts = products.filter(product => {
    // Category filter - support Chinese category matching
    if (filters.category !== 'all') {
      const categoryMatch =
        product.category === filters.category ||
        product.category?.toLowerCase().includes(filters.category.toLowerCase()) ||
        filterOptions.categories.find(cat =>
          cat.id === filters.category &&
          (cat.name === product.category || cat.label === product.category)
        );

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

    // Season filter
    if (filters.season !== 'all' && product.season !== filters.season) {
      return false;
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
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  console.log('Products loaded:', products.length, 'Filtered:', filteredProducts.length);

  const clearFilters = () => {
    setFilters({
      category: 'all',
      fabric: 'all',
      season: 'all',
      style: 'all'
    });
    setSearchQuery('');
    setPriceRange([0, 1000]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header
          searchState={searchState}
          onToggleSearch={toggleSearch}
          onUpdateSearchQuery={updateSearchQuery}
        />
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
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
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
        <Header
          searchState={searchState}
          onToggleSearch={toggleSearch}
          onUpdateSearchQuery={updateSearchQuery}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <p className="text-xl text-red-500">Error loading products: {(error as Error).message}</p>
            <p className="text-text-grey mt-2">Please try refreshing the page.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header
        searchState={searchState}
        onToggleSearch={toggleSearch}
        onUpdateSearchQuery={updateSearchQuery}
      />
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
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-playfair font-semibold text-charcoal mb-4">
            All Products
          </h1>
          <p className="text-xl text-text-grey">
            Browse our complete collection of {filteredProducts.length} premium wholesale garments
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-soft-white rounded-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-charcoal">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-text-grey hover:text-charcoal"
                  data-testid="button-clear-filters"
                >
                  Clear All
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-2 block">Search</label>
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                  data-testid="input-product-search"
                />
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">Category</label>
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
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fabric/Material */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">Material</label>
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
                        {material.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">Season</label>
                <div className="space-y-2">
                  {filterOptions.seasons.slice(1).map((season) => (
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
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-text-grey">
                  {filteredProducts.length} products
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-popular">Most Popular</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
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
                    <Grid3X3 className="h-4 w-4" />
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
                    ? 'No products available. Please add some products from the admin panel.'
                    : 'No products found matching your criteria.'}
                </p>
                {products.length === 0 ? (
                  <p className="text-text-grey mt-2">Visit the admin panel to add your first product.</p>
                ) : (
                  <p className="text-text-grey mt-2">Try adjusting your filters or search terms.</p>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className={`group cursor-pointer border-none shadow-none hover:shadow-lg transition-shadow duration-300 ${
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
                        className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-80'
                        }`}
                        onError={createImageErrorHandler(true)} // Enable debug mode
                      />
                      <Badge className="absolute top-4 right-4 bg-accent-gold text-charcoal">
                        New
                      </Badge>
                    </div>
                    
                    <div className={viewMode === 'list' ? 'flex-1 p-4' : ''}>
                      <h4 className="text-xl font-playfair font-semibold text-charcoal mb-2">
                        {product.name}
                      </h4>
                    </div>
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


