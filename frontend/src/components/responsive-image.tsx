import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { processImagePath, createImageErrorHandler } from "@/lib/image-utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  placeholder?: "blur" | "empty";
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

export default function ResponsiveImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  placeholder = "empty",
  quality = 80,
  onLoad,
  onError
}: ResponsiveImageProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>("");

  useEffect(() => {
    if (!src) return;

    // Process image path with responsive parameters
    const processedSrc = processImagePath(src, {
      quality,
      priority,
      sizes
    });
    
    setImageSrc(processedSrc);
    setIsLoading(true);
    setHasError(false);
  }, [src, quality, priority, sizes]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center p-4">
          <div className="text-gray-400 text-sm">
            {t('image.load_error', 'Image failed to load')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={(e) => {
          createImageErrorHandler({ debug: true, t })(e);
          handleError();
        }}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}
