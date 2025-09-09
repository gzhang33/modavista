import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductsPage from "@/pages/products";
import ProductDetailPage from "@/pages/product-detail";
import ProductModal from "@/components/product-modal";
import { useState, useEffect } from "react";
import { ProductModalState } from "@/types";

// Global scroll to top component
function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top on route change, with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);

    return () => clearTimeout(timer);
  }, [location]);

  return null;
}

function Router() {
  const [productModal, setProductModal] = useState<ProductModalState>({
    isOpen: false,
    productId: null
  });

  const openProductModal = (productId: string) => {
    setProductModal({ isOpen: true, productId });
  };

  const closeProductModal = () => {
    setProductModal({ isOpen: false, productId: null });
  };

  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/">
          <Home />
        </Route>
        <Route path="/products">
          <ProductsPage onOpenProductModal={openProductModal} />
        </Route>
        <Route path="/product/:id">
          <ProductDetailPage />
        </Route>
        <Route component={NotFound} />
      </Switch>

      <ProductModal
        isOpen={productModal.isOpen}
        productId={productModal.productId}
        onClose={closeProductModal}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
