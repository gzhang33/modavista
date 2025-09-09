// 跨页面锚点导航工具函数

/**
 * 处理跨页面的锚点跳转
 * @param sectionId 目标区域的ID
 * @param currentLocation 当前页面路径
 */
export function navigateToSection(sectionId: string, currentLocation: string) {
  // 如果在首页，直接滚动到目标区域
  if (currentLocation === '/') {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    return;
  }

  // 如果不在首页，跳转到首页并在页面加载完成后滚动到目标区域
  const targetUrl = `/#${sectionId}`;
  
  // 监听页面加载完成事件
  const handleLoad = () => {
    // 等待页面完全加载和渲染
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // 100ms 延迟确保页面渲染完成
    
    // 移除事件监听器
    window.removeEventListener('load', handleLoad);
  };

  // 添加页面加载监听器
  window.addEventListener('load', handleLoad);
  
  // 跳转到首页
  window.location.href = targetUrl;
}

/**
 * 处理首页加载时的锚点滚动
 * 当用户直接访问带锚点的URL时（如 /#contact），自动滚动到对应区域
 */
export function handleHashOnLoad() {
  // 检查URL中是否有hash
  const hash = window.location.hash;
  if (hash) {
    const sectionId = hash.substring(1); // 移除 # 符号
    
    // 等待页面和组件完全加载
    setTimeout(() => {
      const element = document.getElementById(sectionId);
      if (element) {
        console.log('Scrolling to section:', sectionId);
        element.scrollIntoView({ behavior: 'smooth' });
      } else {
        console.warn('Element not found:', sectionId);
      }
    }, 300); // 增加延迟确保所有组件都已渲染
  }
}