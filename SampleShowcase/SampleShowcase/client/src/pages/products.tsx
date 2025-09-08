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
import { FilterState, CATEGORIES, FABRICS, SEASONS, STYLES } from "@/types";
import { Link, useLocation } from "wouter";

interface ProductsPageProps {
  onOpenProductModal: (productId: string) => void;
}

export default function ProductsPage({ onOpenProductModal }: ProductsPageProps) {
  const [location] = useLocation();
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

  // Parse URL parameters and set initial filters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const categoryParam = urlParams.get('category');
    
    if (categoryParam && categoryParam !== 'all') {
      setFilters(prev => ({ ...prev, category: categoryParam }));
    }
  }, [location]);

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Filter products based on current filters and search query
  const filteredProducts = products.filter(product => {
    // Category filter
    if (filters.category !== 'all' && product.category !== filters.category) {
      return false;
    }

    // Fabric filter
    if (filters.fabric !== 'all' && !product.fabric.toLowerCase().includes(filters.fabric.toLowerCase())) {
      return false;
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
        product.fabric.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
            Complete Collection
          </h1>
          <p className="text-xl text-text-grey">
            Browse our entire range of premium wholesale garments
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
                  {CATEGORIES.map((category) => (
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

              {/* Fabric */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">Fabric</label>
                <div className="space-y-2">
                  {FABRICS.slice(1).map((fabric) => (
                    <div key={fabric.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={fabric.id}
                        checked={filters.fabric === fabric.id}
                        onCheckedChange={() => updateFilters({ fabric: fabric.id })}
                        data-testid={`checkbox-fabric-${fabric.id}`}
                      />
                      <label
                        htmlFor={fabric.id}
                        className="text-sm text-text-grey cursor-pointer"
                      >
                        {fabric.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Season */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">Season</label>
                <div className="space-y-2">
                  {SEASONS.slice(1).map((season) => (
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

              {/* Style */}
              <div className="mb-6">
                <label className="text-sm font-medium text-charcoal mb-3 block">Style</label>
                <div className="space-y-2">
                  {STYLES.slice(1).map((style) => (
                    <div key={style.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={style.id}
                        checked={filters.style === style.id}
                        onCheckedChange={() => updateFilters({ style: style.id })}
                        data-testid={`checkbox-style-${style.id}`}
                      />
                      <label
                        htmlFor={style.id}
                        className="text-sm text-text-grey cursor-pointer"
                      >
                        {style.name}
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
                <p className="text-xl text-text-grey">No products found matching your criteria.</p>
                <p className="text-text-grey mt-2">Try adjusting your filters or search terms.</p>
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
                    onClick={() => onOpenProductModal(product.id)}
                    data-testid={`card-product-${product.id}`}
                  >
                    <div className={`relative overflow-hidden rounded-lg ${
                      viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'mb-4'
                    }`}>
                      <img
                        src={product.images[0] || '/placeholder-image.jpg'}
                        alt={product.name}
                        className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                          viewMode === 'list' ? 'w-full h-full' : 'w-full h-80'
                        }`}
                      />
                      <Badge className="absolute top-4 right-4 bg-accent-gold text-charcoal">
                        New
                      </Badge>
                    </div>
                    
                    <div className={viewMode === 'list' ? 'flex-1 p-4' : ''}>
                      <h4 className="text-xl font-playfair font-semibold text-charcoal mb-2">
                        {product.name}
                      </h4>
                      <p className="text-text-grey mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-text-grey">{product.fabric}</span>
                        <span className="text-sm text-accent-gold font-semibold capitalize">
                          {product.style}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}