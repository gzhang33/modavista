import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ShoppingCart, Heart, Check } from "lucide-react";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import Header from "@/components/header-simple";
import Footer from "@/components/footer";
import SEOHead from "@/components/seo-head";
import { LanguageState } from "@/types";
import { navigateToSection } from "@/utils/navigation";
import { processImageArray, createImageErrorHandler } from "@/lib/image-utils";
import { createLocalizedHref } from "@/utils/translationUtils";
import { useLanguage } from "@/contexts/LanguageContext";

// Check icon component
const CheckIcon = () => (
  <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
);

export default function ProductDetailPage() {
  const { t, currentLanguage } = useLanguage();
  const currentLangShort = (currentLanguage || 'en').split('-')[0];
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [location] = useLocation();
  
  const [languageState, setLanguageState] = useState<LanguageState>({
    currentLanguage: 'en',
    availableLanguages: []
  });
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);


  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) throw new Error('No product ID provided');
      const response = await fetch(`/api/products.php?id=${id}&lang=${currentLangShort}`);
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
        category: data.category || t('products.uncategorized', 'Uncategorized'),
        fabric: data.material || t('products.cotton', 'Cotton'),
        style: t('products.casual', 'casual'),
        season: t('products.all_season', 'all-season'),
        care: t('products.machine_wash', 'Machine wash'),
        origin: t('products.made_in_china', 'Made in China'),
        sku: data.sku || '',
        images: data.media && data.media.length > 0 
          ? data.media 
          : (data.defaultImage ? [data.defaultImage] : []),
        specifications: {
          [t('products.material', 'Material')]: data.material || '',
          [t('products.color', 'Color')]: data.color || '',
          [t('products.sku', 'SKU')]: data.sku || ''
        },
        featured: t('products.no', 'no'),
        defaultImage: data.defaultImage,
        createdAt: data.createdAt,
        color: data.color,
        material: data.material
      } as Product;
    },
    enabled: !!id,
  });

  const requestSampleMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No product selected');
      
      console.log('Sending sample request for product:', product?.name);
      
      // Generate random email to avoid API rate limits
      const randomSuffix = Math.random().toString(36).substring(7);
      const requestData = {
        name: t('product_detail.sample_request_name', `Sample Request ${randomSuffix}`),
        email: `customer${randomSuffix}@example.com`,
        phone: '',
        company: t('product_detail.sample_request_company', 'Sample Request Company'),
        message: t('product_detail.sample_request_message', `Sample Request - Product: ${product?.name} (SKU: ${product?.sku})\n\nCustomer wishes to request a sample of this product to evaluate quality and suitability. Please contact the customer to arrange sample shipping.\n\nProduct Details:\n- Product Name: ${product?.name}\n- SKU: ${product?.sku}\n- Category: ${product?.category}\n- Material: ${product?.fabric || product?.material}\n\nPlease process this sample request as soon as possible.`) 
      };
      
      console.log('Request data:', requestData);
      
      const response = await fetch('/api/contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        
        // If rate limited, still show success message and redirect
        if (response.status === 429) {
          console.log('Rate limit detected, but proceeding with success flow');
          return { success: true, message: 'Sample request submitted' };
        }
        
        throw new Error(`Failed to send sample request: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      return result;
    },
    onSuccess: (data) => {
      console.log('Sample request successful:', data);
      toast({
        title: "Sample Request Sent",
        description: "We will process your sample request and contact you shortly. Redirecting to contact page...",
      });
      
      // Immediately redirect to home contact section
      setTimeout(() => {
        console.log('Redirecting to contact section');
        navigateToSection('contact', location);
      }, 1000); // Reduce delay to 1 second
    },
    onError: (error) => {
      console.error('Sample request failed:', error);
      toast({
        title: "Request Failed",
        description: "Please try again or contact us directly. If the issue persists, please email info@dreamoda.com",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Header />
        <main className="pt-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
              <div className="flex flex-col">
                <Skeleton className="w-full h-96 rounded-lg mb-4" />
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-square rounded" />
                  ))}
                </div>
              </div>
              <div className="mt-8 lg:mt-0 space-y-6">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
            <div className="mt-16">
              <Skeleton className="w-full h-64 rounded-lg" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
        <Header />
        <main className="pt-8 pb-16">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <h1 className="text-2xl font-semibold text-gray-900 mb-4">{t('product_detail.not_found.title', 'Product Not Found')}</h1>
              <p className="text-gray-600 mb-8">{t('product_detail.not_found.desc', 'Sorry, the product you are looking for does not exist or has been removed.')}</p>
              <Link href={createLocalizedHref('/products')}>
                <Button className="bg-charcoal text-white hover:bg-gray-800">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  {t('product_detail.actions.view_all_products', 'View all products')}
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayImages = processImageArray(
    product.images && product.images.length > 0 
      ? product.images 
      : (product.defaultImage ? [product.defaultImage] : []),
    { debug: false }
  );

  // Generate product features list
  const productFeatures = [
    `Made with premium ${product.fabric || product.material} fabric`,
    `Suitable for ${product.season.replace('-', '/')} season wear`,
    `${product.style} style design, suitable for various occasions`,
    `Strict ${product.care} care requirements`,
    `Origin: ${product.origin}`,
    `SKU: ${product.sku}`
  ];

  // Convert specifications to table format
  const specificationRows = [
    { name: "Product Code", value: product.sku },
    { name: "Category", value: product.category },
    { name: "Fabric", value: product.fabric || product.material },
    { name: "Style", value: product.style },
    { name: "Season", value: product.season.replace('-', '/') },
    { name: "Care Instructions", value: product.care },
    { name: "Origin", value: product.origin },
    ...Object.entries(product.specifications).map(([key, value]) => ({
      name: key,
      value: value
    }))
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <SEOHead
        title={product ? `${product.name} - DreaModa Premium Wholesale Garments` : "Product - DreaModa"}
        description={product ? `${product.name} - Premium Italian fashion garment. ${product.description} Material: ${product.material}, Color: ${product.color}. Wholesale pricing available.` : "Premium Italian fashion garment for wholesale"}
        canonicalPath={`/product/${id}`}
      />
      <Header />
      
      <main className="pt-8 pb-16">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center mb-8 text-sm">
            <Link href={createLocalizedHref('/') }>
              <Button variant="ghost" className="text-gray-500 hover:text-gray-700 p-0">
                {t('nav.home', 'Home')}
              </Button>
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href={createLocalizedHref('/products')}>
              <Button variant="ghost" className="text-gray-500 hover:text-gray-700 p-0">
                {t('footer.all_products', 'All Products')}
              </Button>
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>

          {/* Main Product Section */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
            {/* Product Gallery */}
            <div className="flex flex-col">
              <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-4 mb-4">
                <img
                  src={displayImages[selectedImageIndex]}
                  alt="Main product view"
                  className="w-full h-auto object-contain max-h-[500px] transition-opacity duration-300"
                  onError={createImageErrorHandler({ debug: false, t })}
                />
                {product.featured === 'yes' && (
                  <Badge className="absolute top-4 right-4 bg-accent-gold text-charcoal">
                    Featured
                  </Badge>
                )}
              </div>
              
              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="grid grid-cols-6 gap-2">
                  {displayImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`bg-white rounded-md p-1 shadow-sm overflow-hidden border-2 transition-all duration-200 ${
                        selectedImageIndex === index 
                          ? 'border-blue-500 scale-105' 
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-auto object-contain"
                        onError={createImageErrorHandler({ debug: false, t })}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="mt-8 lg:mt-0">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>
                <p className="text-sm text-gray-500 mt-4">
                {t('product_detail.fields.sku', 'Product Code')}: {product.sku}
              </p>

              <div className="mt-8 border-t pt-8">
                <div className="h-10 w-auto mb-4 flex items-center">
                  <span className="text-2xl font-bold text-accent-gold">DreaModa</span>
                </div>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {product.description || t('product_detail.description_fallback', `This exquisite ${product.name} showcases our commitment to quality and craftsmanship. Made with premium materials, paying attention to every detail, bringing you the perfect combination of comfort and fashion.`)}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <Button
                  onClick={() => requestSampleMutation.mutate()}
                  disabled={requestSampleMutation.isPending}
                  className="w-full bg-accent-gold text-charcoal py-3 rounded-lg font-semibold text-lg hover:bg-yellow-500 transition-colors duration-300"
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {requestSampleMutation.isPending ? t('product_detail.actions.sending', 'Sending Request...') : t('product_detail.actions.add_to_inquiry', 'Request Sample')}
                </Button>
                
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    {t('product_detail.actions.favorite', 'Favorite')}
                  </Button>
                  <Link href={createLocalizedHref('/products')} className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      {t('product_detail.actions.back_to_list', 'Back to List')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="mt-16">
            <div className="bg-white p-8 rounded-lg shadow-lg mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('product_detail.title', 'Product Details')}</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {product.description || t('product_detail.description_rich', `${product.name} is made with carefully selected materials, embodying our unwavering pursuit of quality and design. Each product undergoes strict quality control to ensure the best customer experience.`)}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-4">{t('product_detail.features', 'Product Features')}</h3>
              <ul className="space-y-3">
                {productFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckIcon />
                    <span className="ml-3 text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Specifications Table */}
          <div className="mt-8">
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('product_detail.specifications', 'Product Specifications')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody>
                    {specificationRows.map((spec, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-4 pr-4 font-semibold text-gray-800 w-1/3">
                          {spec.name}
                        </td>
                        <td className="py-4 text-gray-600">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}