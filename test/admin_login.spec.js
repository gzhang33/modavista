// tests/admin_login.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Login Flow', () => {

  // 在每个测试前，导航到登录页面
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin/login.html');
  });

  test('should display login form elements', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/管理员登录/);

    // 验证表单元素是否可见
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show an error message with invalid credentials', async ({ page }) => {
    // 输入错误的凭据
    await page.locator('input[name="username"]').fill('wrong-user');
    await page.locator('input[name="password"]').fill('wrong-password');
    
    // 点击登录按钮
    await page.locator('button[type="submit"]').click();

    // 验证错误消息是否出现
    const error_toast = page.locator('#toast-notification');
    await expect(error_toast).toBeVisible();
    await expect(error_toast).toHaveText(/用户名或密码错误/);
  });

  test('should log in successfully with valid credentials and redirect to dashboard', async ({ page }) => {
    // 输入正确的凭据 (默认: admin / admin)
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin');

    // 点击登录按钮
    await page.locator('button[type="submit"]').click();

    // 等待页面重定向并验证 URL
    await page.waitForURL('**/admin/dashboard.php');
    
    // 验证仪表板上的某个元素是否存在，以确认登录成功
    await expect(page.locator('h2:has-text("展示统计概览")')).toBeVisible();
  });
});
