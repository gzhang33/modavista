import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Eye, Heart, Share2, MessageCircle } from "lucide-react";
import { Product } from "@shared/schemas/schema";
import { processImagePath, createImageErrorHandler } from "@/lib/image-utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProductQuickPreviewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onInquire: (productId: string) => void;
}

export default function ProductQuickPreview({ 
  product, 
  isOpen, 
  onClose, 
  onInquire 
}: ProductQuickPreviewProps) {
  const { t } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleInquire = () => {
    onInquire(String(product.id));
    onClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const images = product.images || (product.defaultImage ? [product.defaultImage] : []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-playfair font-semibold text-charcoal">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={processImagePath(images[selectedImageIndex] || images[0])}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={createImageErrorHandler({ debug: true, t })}
              />
              <Badge className="absolute top-4 right-4 bg-accent-gold text-charcoal">
                {t('common.badges.new', 'New')}
              </Badge>
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                      selectedImageIndex === index 
                        ? 'border-accent-gold' 
                        : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={processImagePath(image)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-contain"
                      onError={createImageErrorHandler({ debug: true, t })}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-charcoal mb-2">
                {t('product.details', 'Product Details')}
              </h3>
              <p className="text-text-grey leading-relaxed">
                {product.description || t('product.no_description', 'No description available.')}
              </p>
            </div>

            {/* Specifications */}
            <div>
              <h4 className="text-md font-semibold text-charcoal mb-3">
                {t('product.specifications', 'Specifications')}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-charcoal">{t('product.category', 'Category')}:</span>
                  <span className="text-text-grey ml-2">{product.category}</span>
                </div>
                <div>
                  <span className="font-medium text-charcoal">{t('product.material', 'Material')}:</span>
                  <span className="text-text-grey ml-2">{product.material || product.fabric}</span>
                </div>
                <div>
                  <span className="font-medium text-charcoal">{t('product.color', 'Color')}:</span>
                  <span className="text-text-grey ml-2">{product.color || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-charcoal">{t('product.season', 'Season')}:</span>
                  <span className="text-text-grey ml-2">{product.season}</span>
                </div>
                {product.sku && (
                  <div className="col-span-2">
                    <span className="font-medium text-charcoal">{t('product.sku', 'SKU')}:</span>
                    <span className="text-text-grey ml-2">{product.sku}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleInquire}
                className="w-full bg-charcoal text-white hover:bg-gray-800 min-h-[44px]"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                {t('product.inquire', 'Request Information')}
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleShare}
                  className="flex-1 min-h-[44px]"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  {t('product.share', 'Share')}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 min-h-[44px]"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  {t('product.favorite', 'Save')}
                </Button>
              </div>
            </div>

            {/* B2B Information */}
            <Card className="p-4 bg-soft-white">
              <h4 className="text-md font-semibold text-charcoal mb-2">
                {t('product.b2b_info', 'Wholesale Information')}
              </h4>
              <p className="text-sm text-text-grey">
                {t('product.b2b_description', 'Contact us for wholesale pricing, minimum order quantities, and custom specifications.')}
              </p>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
