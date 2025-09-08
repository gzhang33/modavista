import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductsPage from "@/pages/products";
import ProductModal from "@/components/product-modal";
import { useState } from "react";
import { ProductModalState } from "@/types";

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
      <Switch>
        <Route path="/">
          <Home onOpenProductModal={openProductModal} />
        </Route>
        <Route path="/products">
          <ProductsPage onOpenProductModal={openProductModal} />
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
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
