// test/validate_test_environment.js
// 测试环境验证脚本 - 在运行测试前验证环境配置

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 验证测试环境配置...\n');

const checks = [
  {
    name: '检查 Playwright 配置',
    check: () => {
      const configPath = 'playwright.config.js';
      if (!fs.existsSync(configPath)) {
        throw new Error('playwright.config.js 文件不存在');
      }
      
      const config = fs.readFileSync(configPath, 'utf8');
      if (config.includes('http://localhost/htdocs')) {
        throw new Error('baseURL 配置错误：应该使用 http://localhost 而不是 http://localhost/htdocs');
      }
      
      if (!config.includes('http://localhost')) {
        throw new Error('baseURL 未正确设置为 http://localhost');
      }
      
      return '✅ Playwright 配置正确';
    }
  },
  {
    name: '检查 Apache/XAMPP 服务',
    check: async () => {
      try {
        // 使用 PowerShell 检查端口 80 是否被占用（表示 Apache 正在运行）
        const result = execSync('powershell "Get-NetTCPConnection -LocalPort 80 -State Listen 2>$null | Measure-Object | Select-Object -ExpandProperty Count"', { encoding: 'utf8' });
        const count = parseInt(result.trim());
        
        if (count === 0) {
          throw new Error('Apache 服务未运行 - 请启动 XAMPP');
        }
        
        return '✅ Apache 服务正在运行';
      } catch (error) {
        throw new Error('无法检查 Apache 状态 - 请确保 XAMPP 正在运行');
      }
    }
  },
  {
    name: '检查项目文件结构',
    check: () => {
      const requiredFiles = [
        'index.html',
        'product.html',
        'admin/login.html',
        'admin/dashboard.php',
        'api/products.php',
        'api/categories.php',
        'api/config.php'
      ];
      
      const missingFiles = requiredFiles.filter(file => !fs.existsSync(file));
      
      if (missingFiles.length > 0) {
        throw new Error(`缺少必要文件: ${missingFiles.join(', ')}`);
      }
      
      return '✅ 项目文件结构完整';
    }
  },
  {
    name: '检查测试文件',
    check: () => {
      const testFiles = [
        'test/public_site_basic.spec.js',
        'test/admin_login.spec.js',
        'test/admin_dashboard.spec.js',
        'test/session_handling.spec.js'
      ];
      
      const missingTests = testFiles.filter(file => !fs.existsSync(file));
      
      if (missingTests.length > 0) {
        throw new Error(`缺少测试文件: ${missingTests.join(', ')}`);
      }
      
      return '✅ 测试文件齐全';
    }
  },
  {
    name: '检查 Playwright 浏览器',
    check: () => {
      try {
        execSync('npx playwright --version', { stdio: 'ignore' });
        return '✅ Playwright 已安装';
      } catch (error) {
        throw new Error('Playwright 未安装 - 请运行 npm install @playwright/test');
      }
    }
  },
  {
    name: '检查网站可访问性',
    check: async () => {
      try {
        // 使用 PowerShell 检查网站是否可访问
        execSync('powershell "Invoke-WebRequest -Uri http://localhost/index.html -Method Head -TimeoutSec 5" 2>$null', { stdio: 'ignore' });
        return '✅ 网站可访问';
      } catch (error) {
        throw new Error('网站无法访问 - 请确保 Apache 运行且项目位于正确目录');
      }
    }
  },
  {
    name: '检查 API 端点',
    check: async () => {
      try {
        // 检查产品 API
        execSync('powershell "Invoke-WebRequest -Uri http://localhost/api/products.php -Method Head -TimeoutSec 5" 2>$null', { stdio: 'ignore' });
        return '✅ API 端点可访问';
      } catch (error) {
        throw new Error('API 端点无法访问 - 请检查 PHP 配置');
      }
    }
  }
];

async function runValidation() {
  let passed = 0;
  let failed = 0;
  
  console.log('🔍 运行环境验证检查...\n');
  
  for (const checkItem of checks) {
    try {
      const result = await checkItem.check();
      console.log(`${result}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${checkItem.name}: ${error.message}`);
      failed++;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 验证结果总结');
  console.log('='.repeat(50));
  console.log(`✅ 通过: ${passed} 项检查`);
  console.log(`❌ 失败: ${failed} 项检查`);
  console.log(`📈 总计: ${passed + failed} 项检查\n`);
  
  if (failed === 0) {
    console.log('🎉 所有检查都通过了！环境已准备就绪，可以运行测试。');
    console.log('\n建议的测试命令:');
    console.log('  npx playwright test test/public_site_basic.spec.js');
    console.log('  node test/run_dashboard_tests.js');
    return true;
  } else {
    console.log('⚠️  有部分检查失败，请修复上述问题后再运行测试。');
    console.log('\n常见解决方案:');
    console.log('  1. 启动 XAMPP 控制面板');
    console.log('  2. 启动 Apache 和 MySQL 服务');
    console.log('  3. 确保项目在正确的 htdocs 目录中');
    console.log('  4. 运行 npm install @playwright/test');
    console.log('  5. 运行 npx playwright install');
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runValidation().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ 验证过程中出现错误:', error.message);
    process.exit(1);
  });
}

module.exports = { runValidation };