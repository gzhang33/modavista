import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from "lucide-react";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { processImagePath, createImageErrorHandler } from "@/lib/image-utils";

interface ProductModalProps {
  isOpen: boolean;
  productId: string | null;
  onClose: () => void;
}

export default function ProductModal({ isOpen, productId, onClose }: ProductModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId) throw new Error('No product ID provided');
      const response = await fetch(`/api/products.php?id=${productId}&lang=en`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }
      const data = await response.json();
      
      console.log('Product API response:', data);
      
      if (!data) {
        throw new Error('Product not found');
      }
      
      // Adapt product variant data to frontend Product interface
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        category: data.category || 'Uncategorized',
        fabric: data.material || 'Cotton',
        style: 'casual',
        season: 'all-season',
        care: 'Machine wash',
        origin: 'Made in China',
        sku: data.sku || '',
        images: data.media && data.media.length > 0 
          ? data.media 
          : (data.defaultImage ? [data.defaultImage] : []),
        specifications: {
          'Material': data.material || '',
          'Color': data.color || '',
          'SKU': data.sku || ''
        },
        featured: 'no',
        defaultImage: data.defaultImage,
        createdAt: data.createdAt,
        color: data.color,
        material: data.material
      } as Product;
    },
    enabled: !!productId && isOpen,
  });

  const requestSampleMutation = useMutation({
    mutationFn: async () => {
      if (!productId) throw new Error('No product selected');
      
      return apiRequest('POST', '/api/inquiries', {
        firstName: 'Sample',
        lastName: 'Request',
        email: 'sample@example.com',
        company: 'Sample Company',
        businessType: 'retailer',
        message: `Sample request for product: ${product?.name} (SKU: ${product?.sku})`,
        productId,
        inquiryType: 'sample'
      });
    },
    onSuccess: () => {
      toast({
        title: "Sample Request Sent",
        description: "We'll process your sample request and contact you shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/inquiries'] });
      onClose();
    },
    onError: () => {
      toast({
        title: "Request Failed",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });

  if (!isOpen || !productId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-gray-500 hover:text-charcoal"
          data-testid="button-close-modal"
        >
          <X className="h-6 w-6" />
        </Button>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-96 lg:h-full bg-soft-white">
              <Skeleton className="w-full h-full" />
            </div>
            <div className="p-8 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ) : product ? (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="relative">
              <img
                src={processImagePath(
                  product.images && product.images[0] 
                    ? product.images[0]
                    : '/placeholder-image.svg',
                  { debug: false }
                )}
                alt={product.name}
                className="w-full h-96 lg:h-full object-cover"
                onError={createImageErrorHandler(false)}
              />
            </div>
            
            <div className="p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-3xl font-playfair font-semibold text-charcoal">
                  {product.name}
                </DialogTitle>
              </DialogHeader>
              
              <p className="text-text-grey mb-6 text-lg leading-relaxed">
                {product.description}
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-charcoal">Fabric:</span>
                  <span className="text-text-grey">{product.fabric}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-charcoal">Care:</span>
                  <span className="text-text-grey">{product.care}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-charcoal">Origin:</span>
                  <span className="text-text-grey">{product.origin}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-charcoal">Style:</span>
                  <span className="text-text-grey capitalize">{product.style}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="font-semibold text-charcoal">Season:</span>
                  <span className="text-text-grey capitalize">{product.season.replace('-', '/')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-charcoal">SKU:</span>
                  <span className="text-accent-gold font-semibold">{product.sku}</span>
                </div>
              </div>

              {Object.keys(product.specifications).length > 0 && (
                <div className="mb-8">
                  <h4 className="font-semibold text-charcoal mb-4">Specifications:</h4>
                  <div className="space-y-2">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-text-grey">{key}:</span>
                        <span className="text-charcoal">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <Button
                onClick={() => requestSampleMutation.mutate()}
                disabled={requestSampleMutation.isPending}
                className="w-full bg-accent-gold text-charcoal py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors duration-300"
                data-testid="button-request-sample"
              >
                {requestSampleMutation.isPending ? 'Sending Request...' : 'Request Sample'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-text-grey">Product not found.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
