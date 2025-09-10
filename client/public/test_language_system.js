// 语言系统测试脚本
// 用于验证多语言功能是否正常工作

console.log('=== 语言系统测试 ===');

// 1. 检查静态翻译文件
async function testStaticTranslations() {
  console.log('\n1. 测试静态翻译文件');

  try {
    const response = await fetch('/locales/en.json');
    if (response.ok) {
      const translations = await response.json();
      console.log('✅ 英文翻译文件加载成功');
      console.log('📊 翻译键数量:', Object.keys(translations).length);

      // 检查关键翻译
      const keyChecks = [
        'nav.home',
        'home.hero.title',
        'common.loading'
      ];

      keyChecks.forEach(key => {
        const value = getNestedValue(translations, key);
        console.log(`  ${key}: ${value ? '✅' : '❌'} ${value || '未找到'}`);
      });

    } else {
      console.log('❌ 英文翻译文件加载失败');
    }
  } catch (error) {
    console.log('❌ 静态翻译文件测试失败:', error.message);
  }
}

// 获取嵌套对象的值
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// 2. 检查语言API
async function testLanguageAPI() {
  console.log('\n2. 测试语言API');

  try {
    const response = await fetch('/api/language.php?action=languages');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ 语言API响应成功');
      console.log('📊 可用语言数量:', data.languages?.length || 0);

      if (data.languages) {
        data.languages.forEach(lang => {
          console.log(`  - ${lang.language_code}: ${lang.language_name_native} (${lang.language_name})`);
        });

        // 检查是否只有英文
        const hasChinese = data.languages.some(lang => lang.language_code === 'zh');
        console.log(`  中文选项: ${hasChinese ? '❌ 仍存在' : '✅ 已删除'}`);
      }

    } else {
      console.log('❌ 语言API响应失败');
    }
  } catch (error) {
    console.log('❌ 语言API测试失败:', error.message);
  }
}

// 3. 检查翻译API
async function testTranslationAPI() {
  console.log('\n3. 测试翻译API');

  const testKeys = [
    'nav.home',
    'home.hero.title',
    'nonexistent.key'
  ];

  for (const key of testKeys) {
    try {
      const response = await fetch(`/api/language.php?action=translation&key=${encodeURIComponent(key)}`);
      if (response.ok) {
        const data = await response.json();
        console.log(`  ${key}: ${data.text ? '✅ ' + data.text : '❌ 未找到翻译'}`);
      } else {
        console.log(`  ${key}: ❌ API响应失败`);
      }
    } catch (error) {
      console.log(`  ${key}: ❌ 请求失败 - ${error.message}`);
    }
  }
}

// 4. 检查页面内容
function testPageContent() {
  console.log('\n4. 检查页面内容');

  // 检查标题
  const title = document.title;
  console.log('📄 页面标题:', title);

  // 检查语言切换按钮
  const globeIcon = document.querySelector('svg.lucide-globe');
  if (globeIcon) {
    const button = globeIcon.closest('button');
    if (button) {
      const buttonText = button.textContent?.trim();
      console.log('🌐 语言切换按钮:', buttonText);
      console.log('✅ 语言切换按钮存在');
    }
  } else {
    console.log('❌ 未找到语言切换按钮');
  }

  // 检查导航文本
  const navLinks = document.querySelectorAll('nav a, header a');
  if (navLinks.length > 0) {
    console.log('🧭 导航链接:');
    navLinks.forEach(link => {
      const text = link.textContent?.trim();
      if (text && text.length > 0) {
        console.log(`  - ${text}`);
      }
    });
  }

  // 检查Hero内容
  const heroTitle = document.querySelector('h2');
  if (heroTitle) {
    console.log('🎯 Hero标题:', heroTitle.textContent);
  }

  const heroSubtitle = document.querySelector('p');
  if (heroSubtitle) {
    console.log('📝 Hero副标题:', heroSubtitle.textContent?.substring(0, 100) + '...');
  }
}

// 运行所有测试
async function runTests() {
  console.log('开始测试多语言系统...\n');

  await testStaticTranslations();
  await testLanguageAPI();
  await testTranslationAPI();
  testPageContent();

  console.log('\n=== 测试完成 ===');
}

// 页面加载完成后运行测试
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runTests);
} else {
  runTests();
}

// 也可以手动调用
window.testLanguageSystem = runTests;
