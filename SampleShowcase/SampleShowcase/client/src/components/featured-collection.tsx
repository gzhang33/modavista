import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Product } from "@shared/schema";
import { FilterState } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface FeaturedCollectionProps {
  filters: FilterState;
  searchQuery: string;
  onOpenProductModal: (productId: string) => void;
}

export default function FeaturedCollection({ 
  filters, 
  searchQuery, 
  onOpenProductModal 
}: FeaturedCollectionProps) {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/featured'],
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

  const [, setLocation] = useLocation();

  const loadMoreProducts = () => {
    setLocation('/products');
  };

  if (isLoading) {
    return (
      <section className="py-16" id="collections">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-playfair font-semibold text-charcoal mb-4">Featured Collection</h3>
            <p className="text-xl text-text-grey max-w-2xl mx-auto">
              Handpicked selections from our latest seasonal collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="w-full h-96 rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16" id="collections">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-playfair font-semibold text-charcoal mb-4">Featured Collection</h3>
          <p className="text-xl text-text-grey max-w-2xl mx-auto">
            Handpicked selections from our latest seasonal collection, showcasing exceptional craftsmanship and contemporary design
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-text-grey">No products found matching your criteria.</p>
            <p className="text-text-grey mt-2">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer border-none shadow-none hover:shadow-lg transition-shadow duration-300"
                  onClick={() => onOpenProductModal(product.id)}
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={product.images[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                      className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-4 right-4 bg-accent-gold text-charcoal">
                      New
                    </Badge>
                  </div>
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
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                onClick={loadMoreProducts}
                className="bg-charcoal text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition-colors duration-300"
                data-testid="button-view-complete-collection"
              >
                View Complete Collection
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
