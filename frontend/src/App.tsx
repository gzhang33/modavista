import React, { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import CollectionsPage from "@/pages/collections";
import ProductDetailPage from "@/pages/product-detail";
import ProductModal from "@/components/product-modal";
import PerformanceOptimizer from "@/components/performance-optimizer";
import { ProductModalState } from "@/types";
import { SUPPORTED_LANGUAGES, getLanguageFromURL } from "@/utils/translationUtils";
import { MessageCircle } from "lucide-react";

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

// WhatsApp悬浮按钮组件
function WhatsAppFloatingButton() {
  const { t, currentLanguage } = useLanguage();
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const [clickCount, setClickCount] = useState<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const now = Date.now();
    const timeDiff = now - lastClickTime;
    
    // 检查点击频率（防止短时间内重复点击）
    if (timeDiff < 5000) { // 5秒内不能重复点击
      e.preventDefault();
      alert(t('errors.contact.rate_limited') || 'Please wait before sending another message.');
      return;
    }
    
    // 检查点击次数（防止批量滥发）
    if (clickCount >= 5) { // 每小时最多5次
      const oneHourAgo = now - 60 * 60 * 1000;
      if (lastClickTime > oneHourAgo) {
        e.preventDefault();
        alert(t('errors.contact.rate_limited') || 'Too many requests. Please try again later.');
        return;
      } else {
        // 重置计数器
        setClickCount(0);
      }
    }
    
    // 更新点击时间和计数
    setLastClickTime(now);
    setClickCount(prev => prev + 1);
    
    // 构造自动发送的消息（根据当前语言）
    const defaultMessage = currentLanguage === 'it' 
      ? "Sono interessato al vostro business di abbigliamento all'ingrosso. Posso avere ulteriori dettagli?"
      : "I'm interested in your wholesale clothing business. May I have further details?";
    const message = encodeURIComponent(t('home.contact.auto_message') || defaultMessage);
    const whatsappUrl = `https://wa.me/393888518810?text=${message}`;
    
    // 设置链接
    e.currentTarget.href = whatsappUrl;
  };

  return (
    <a 
      href="https://wa.me/393888518810" 
      target="_blank" 
      rel="noopener noreferrer"
      className="whatsapp-floating-button"
      aria-label="Contact us on WhatsApp"
      onClick={handleClick}
    >
      <MessageCircle size={24} />
    </a>
  );
}

// 多语言路由组件
function MultilingualRoutes() {
  const { isLoading, isInitialized } = useLanguage();
  const [productModal, setProductModal] = useState<ProductModalState>({
    isOpen: false,
    productId: null
  });

  // 显示加载状态直到翻译加载完成
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto mb-4"></div>
          <p className="text-text-grey">Loading...</p>
        </div>
      </div>
    );
  }

  const openProductModal = (productId: string) => {
    setProductModal({ isOpen: true, productId });
  };

  const closeProductModal = () => {
    setProductModal({ isOpen: false, productId: null });
  };

  return (
    <>
      <ScrollToTop />
      <PerformanceOptimizer />
      
      {/* WhatsApp悬浮按钮 */}
      <WhatsAppFloatingButton />

      {/* 产品模态框 */}
      <ProductModal
        isOpen={productModal.isOpen}
        productId={productModal.productId}
        onClose={closeProductModal}
      />

      <Switch>
        {/* 多语言路由 - 放在前面，因为它们更具体 */}
        {SUPPORTED_LANGUAGES.map(lang => (
          lang !== 'en' && (
            <React.Fragment key={lang}>
              {/* 多语言产品详情路由 - 放在最前面，因为最具体 */}
              <Route path={`/${lang}/product/:id`}>
                <ProductDetailPage />
              </Route>

              {/* 多语言产品页面路由 */}
              <Route path={`/${lang}/collections`}>
                <CollectionsPage onOpenProductModal={openProductModal} />
              </Route>

              {/* 多语言主页路由 */}
              <Route path={`/${lang}/`}>
                <Home />
              </Route>
              <Route path={`/${lang}`}>
                <Home />
              </Route>
            </React.Fragment>
          )
        ))}

        {/* 默认路由（英文） */}
        <Route path="/product/:id">
          <ProductDetailPage />
        </Route>
        <Route path="/collections">
          <CollectionsPage onOpenProductModal={openProductModal} />
        </Route>
        <Route path="/">
          <Home />
        </Route>

        {/* 调试路由 - 临时添加，稍后移除 */}
        <Route path="/debug">
          <div style={{padding: '20px', fontFamily: 'monospace'}}>
            <h2>路由调试信息</h2>
            <p>当前路径: {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</p>
            <p>检测到的语言: {typeof window !== 'undefined' ? getLanguageFromURL() || '无' : 'SSR'}</p>
            <p>支持的语言: {SUPPORTED_LANGUAGES.join(', ')}</p>
            <button onClick={() => console.log('当前路由状态:', {
              pathname: window.location.pathname,
              language: getLanguageFromURL(),
              segments: window.location.pathname.split('/').filter(Boolean)
            })}>
              记录调试信息
            </button>
            <br /><br />
            <button onClick={() => {
              // 测试语言切换
              console.log('测试语言切换到法语...');
              if (typeof window !== 'undefined') {
                window.location.href = '/fr';
              }
            }}>
              测试跳转到 /fr
            </button>
          </div>
        </Route>

        {/* 404页面 */}
        <Route path="*">
          <NotFound />
        </Route>
      </Switch>
    </>
  );
}

function Router() {
  return <MultilingualRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        {/* <TooltipProvider> */}
          {/* <Toaster /> */}
          <Router />
        {/* </TooltipProvider> */}
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;