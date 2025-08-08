// test/run_dashboard_tests.js
// 测试运行脚本 - 专门用于运行dashboard相关的测试

const { execSync } = require('child_process');
const { runValidation } = require('./validate_test_environment');

console.log('🚀 开始运行管理后台测试...\n');

// 首先验证测试环境
async function validateEnvironment() {
  console.log('🔍 验证测试环境...\n');
  const isValid = await runValidation();
  if (!isValid) {
    console.log('\n❌ 环境验证失败，停止测试执行。');
    process.exit(1);
  }
  console.log('\n✅ 环境验证通过，继续执行测试...\n');
}

// 定义测试套件
const testSuites = [
  {
    name: '管理员登录测试',
    file: 'test/admin_login.spec.js',
    description: '测试管理员登录功能'
  },
  {
    name: '管理后台功能测试',
    file: 'test/admin_dashboard.spec.js',
    description: '测试dashboard页面的各种功能'
  },
  {
    name: '会话过期处理测试',
    file: 'test/session_handling.spec.js',
    description: '测试会话过期时的错误处理逻辑'
  }
];

// 运行单个测试套件
function runTestSuite(suite) {
  console.log(`📋 运行: ${suite.name}`);
  console.log(`📝 描述: ${suite.description}`);
  console.log(`📁 文件: ${suite.file}\n`);
  
  try {
    execSync(`npx playwright test ${suite.file}`, { 
      stdio: 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${suite.name} - 测试通过\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${suite.name} - 测试失败\n`);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  // 首先验证环境
  await validateEnvironment();
  
  let passed = 0;
  let failed = 0;
  
  console.log('=====================================');
  console.log('🧪 Fashion Factory Dashboard Tests');
  console.log('=====================================\n');
  
  for (const suite of testSuites) {
    const success = runTestSuite(suite);
    if (success) {
      passed++;
    } else {
      failed++;
    }
    console.log('-------------------------------------\n');
  }
  
  // 输出总结
  console.log('=====================================');
  console.log('📊 测试结果总结');
  console.log('=====================================');
  console.log(`✅ 通过: ${passed} 个测试套件`);
  console.log(`❌ 失败: ${failed} 个测试套件`);
  console.log(`📈 总计: ${passed + failed} 个测试套件\n`);
  
  if (failed === 0) {
    console.log('🎉 所有测试都通过了！');
  } else {
    console.log('⚠️  有部分测试失败，请检查上述错误信息。');
  }
}

// 检查是否提供了特定测试文件参数
const args = process.argv.slice(2);
if (args.length > 0) {
  const testFile = args[0];
  const suite = testSuites.find(s => s.file.includes(testFile));
  if (suite) {
    runTestSuite(suite);
  } else {
    console.log(`❌ 未找到测试文件: ${testFile}`);
    console.log('可用的测试文件:');
    testSuites.forEach(s => console.log(`  - ${s.file}`));
  }
} else {
  runAllTests();
}