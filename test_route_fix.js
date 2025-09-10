// test_route_fix.js - 测试路由修复
// 在浏览器控制台中运行此脚本

console.log('=== 路由修复测试 ===');

// 模拟语言切换场景
function testRouteFix() {
  const scenarios = [
    {
      description: '从 / 切换到法语',
      currentPath: '/',
      currentLang: 'en',
      targetLang: 'fr',
      expectedPath: '/fr'
    },
    {
      description: '从 /fr 切换到德语',
      currentPath: '/fr',
      currentLang: 'fr',
      targetLang: 'de',
      expectedPath: '/de'
    },
    {
      description: '从 /fr/products 切换到德语',
      currentPath: '/fr/products',
      currentLang: 'fr',
      targetLang: 'de',
      expectedPath: '/de/products'
    },
    {
      description: '从 /fr 切换回英文',
      currentPath: '/fr',
      currentLang: 'fr',
      targetLang: 'en',
      expectedPath: '/'
    }
  ];

  scenarios.forEach((scenario, index) => {
    console.log(`\n场景 ${index + 1}: ${scenario.description}`);

    // 模拟当前路径
    const originalPathname = window.location.pathname;
    Object.defineProperty(window.location, 'pathname', {
      value: scenario.currentPath,
      writable: true
    });

    // 测试路径处理逻辑
    const urlLang = getLanguageFromURL();
    const pathWithoutLang = getPathWithoutLanguage();
    const needsRedirect = shouldRedirectToLocalizedPath(scenario.currentLang, scenario.targetLang);
    const newPath = buildLocalizedPath(pathWithoutLang, scenario.targetLang);

    console.log(`  当前路径: ${scenario.currentPath}`);
    console.log(`  检测语言: ${urlLang || '无'}`);
    console.log(`  无语言路径: ${pathWithoutLang}`);
    console.log(`  需要重定向: ${needsRedirect}`);
    console.log(`  新路径: ${newPath}`);
    console.log(`  期望路径: ${scenario.expectedPath}`);
    console.log(`  ✅ 测试: ${newPath === scenario.expectedPath ? '通过' : '失败'}`);

    // 恢复原始路径
    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });
}

// 运行测试
if (typeof getLanguageFromURL === 'function' &&
    typeof getPathWithoutLanguage === 'function' &&
    typeof shouldRedirectToLocalizedPath === 'function' &&
    typeof buildLocalizedPath === 'function') {

  testRouteFix();
  console.log('\n=== 测试完成 ===');

} else {
  console.log('❌ 错误：必要的函数不可用，请确保已加载 translationUtils');
}

