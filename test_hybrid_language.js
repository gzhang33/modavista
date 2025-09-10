// test_hybrid_language.js - 混合语言系统测试脚本
// 在浏览器控制台中运行此脚本测试基础功能

console.log('=== 混合语言系统测试开始 ===');

// 导入工具函数（在浏览器环境中需要先加载）
const { SUPPORTED_LANGUAGES, LANGUAGE_TO_LOCALE } = window.translationUtils || {};

// 测试1: URL路径检测
console.log('\n1. 测试URL路径检测');
function testURLDetection() {
  // 模拟不同URL路径
  const testURLs = [
    'https://domain.com/',
    'https://domain.com/en',
    'https://domain.com/fr/products',
    'https://domain.com/de/contact',
    'https://domain.com/it/about',
    'https://domain.com/es/collections'
  ];

  testURLs.forEach(url => {
    // 模拟设置window.location.pathname
    const originalPathname = window.location.pathname;
    const testPath = new URL(url).pathname;
    Object.defineProperty(window.location, 'pathname', {
      value: testPath,
      writable: true
    });

    // 测试URL检测
    const detectedLang = getLanguageFromURL();
    console.log(`URL: ${url} -> 检测语言: ${detectedLang || 'null'}`);

    // 恢复原始pathname
    Object.defineProperty(window.location, 'pathname', {
      value: originalPathname,
      writable: true
    });
  });
}

// 测试2: 语言优先级检测
console.log('\n2. 测试语言优先级检测');
function testLanguagePriority() {
  // 清空存储
  localStorage.removeItem('user_language');
  sessionStorage.removeItem('user_language');

  // 测试场景1: 只有浏览器语言
  navigator.language = 'fr-FR';
  const lang1 = detectLanguagePriority();
  console.log(`场景1 (浏览器: fr-FR): ${lang1}`);

  // 测试场景2: 有Session存储
  sessionStorage.setItem('user_language', 'de');
  const lang2 = detectLanguagePriority();
  console.log(`场景2 (Session: de): ${lang2}`);

  // 测试场景3: 有URL路径（最高优先级）
  Object.defineProperty(window.location, 'pathname', {
    value: '/it/products',
    writable: true
  });
  const lang3 = detectLanguagePriority();
  console.log(`场景3 (URL: /it/products): ${lang3}`);

  // 清理
  localStorage.removeItem('user_language');
  sessionStorage.removeItem('user_language');
}

// 测试3: 路径构建
console.log('\n3. 测试路径构建');
function testPathBuilding() {
  const testPaths = [
    '/',
    '/products',
    '/product/123',
    '/contact',
    '/about'
  ];

  SUPPORTED_LANGUAGES.forEach(lang => {
    console.log(`\n语言: ${lang}`);
    testPaths.forEach(path => {
      const localizedPath = buildLocalizedPath(path, lang);
      console.log(`  ${path} -> ${localizedPath}`);
    });
  });
}

// 测试4: 语言偏好保存
console.log('\n4. 测试语言偏好保存');
function testLanguagePreference() {
  console.log('保存语言偏好...');
  saveLanguagePreference('fr');

  const sessionLang = sessionStorage.getItem('user_language');
  const localLang = localStorage.getItem('user_language');

  console.log(`Session存储: ${sessionLang}`);
  console.log(`Local存储: ${localLang}`);

  // 清理测试数据
  sessionStorage.removeItem('user_language');
  localStorage.removeItem('user_language');
}

// 测试5: 重定向逻辑
console.log('\n5. 测试重定向逻辑');
function testRedirectLogic() {
  // 测试场景
  const scenarios = [
    { current: 'en', target: 'fr', url: '/', expected: true },
    { current: 'en', target: 'en', url: '/', expected: false },
    { current: 'fr', target: 'de', url: '/fr/products', expected: true },
    { current: 'fr', target: 'fr', url: '/fr/products', expected: false }
  ];

  scenarios.forEach(scenario => {
    // 设置URL
    Object.defineProperty(window.location, 'pathname', {
      value: scenario.url,
      writable: true
    });

    const shouldRedirect = shouldRedirectToLocalizedPath(scenario.current, scenario.target);
    console.log(`当前: ${scenario.current}, 目标: ${scenario.target}, URL: ${scenario.url} -> 重定向: ${shouldRedirect}`);
  });
}

// 运行所有测试
console.log('\n=== 开始执行测试 ===');
testURLDetection();
testLanguagePriority();
testPathBuilding();
testLanguagePreference();
testRedirectLogic();

console.log('\n=== 测试完成 ===');
console.log('请检查控制台输出确认所有功能正常工作');

