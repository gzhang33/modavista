// test/check_config.js
// 快速配置检查脚本

const fs = require('fs');

console.log('🔧 检查项目配置...\n');

// 检查 Playwright 配置
function checkPlaywrightConfig() {
  try {
    const config = fs.readFileSync('playwright.config.js', 'utf8');
    
    if (config.includes('http://localhost/htdocs')) {
      console.log('❌ Playwright baseURL 配置错误');
      console.log('   当前: http://localhost/htdocs');
      console.log('   应为: http://localhost');
      console.log('   请修改 playwright.config.js 中的 baseURL 设置\n');
      return false;
    } else if (config.includes('http://localhost')) {
      console.log('✅ Playwright baseURL 配置正确: http://localhost\n');
      return true;
    } else {
      console.log('⚠️  未找到 baseURL 配置\n');
      return false;
    }
  } catch (error) {
    console.log('❌ 无法读取 playwright.config.js 文件\n');
    return false;
  }
}

// 检查 API 配置
function checkApiConfig() {
  if (fs.existsSync('api/config.php')) {
    console.log('✅ API 配置文件存在: api/config.php');
    
    try {
      const config = fs.readFileSync('api/config.php', 'utf8');
      
      if (config.includes('DB_HOST') && config.includes('DB_USER')) {
        console.log('✅ 数据库配置变量已定义\n');
        return true;
      } else {
        console.log('⚠️  数据库配置可能不完整\n');
        return false;
      }
    } catch (error) {
      console.log('⚠️  无法读取 API 配置文件\n');
      return false;
    }
  } else {
    console.log('❌ API 配置文件不存在: api/config.php');
    console.log('   请确保配置文件已创建并包含数据库连接信息\n');
    return false;
  }
}

// 检查测试文件
function checkTestFiles() {
  const requiredTests = [
    'test/public_site_basic.spec.js',
    'test/admin_login.spec.js', 
    'test/admin_dashboard.spec.js',
    'test/session_handling.spec.js'
  ];
  
  let allExist = true;
  
  requiredTests.forEach(testFile => {
    if (fs.existsSync(testFile)) {
      console.log(`✅ ${testFile}`);
    } else {
      console.log(`❌ ${testFile} - 文件不存在`);
      allExist = false;
    }
  });
  
  console.log('');
  return allExist;
}

// 主检查函数
function runConfigCheck() {
  console.log('正在检查关键配置项...\n');
  
  const playwrightOk = checkPlaywrightConfig();
  const apiOk = checkApiConfig();
  const testsOk = checkTestFiles();
  
  if (playwrightOk && apiOk && testsOk) {
    console.log('🎉 所有配置检查通过！');
    console.log('\n下一步：');
    console.log('1. 启动 XAMPP (Apache + MySQL)');
    console.log('2. 运行测试: node test/validate_test_environment.js');
    console.log('3. 执行测试: npx playwright test');
    return true;
  } else {
    console.log('⚠️  发现配置问题，请修复后重试。');
    return false;
  }
}

if (require.main === module) {
  const success = runConfigCheck();
  process.exit(success ? 0 : 1);
}

module.exports = { runConfigCheck };