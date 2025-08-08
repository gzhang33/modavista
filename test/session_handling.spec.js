// test/session_handling.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Session Expiry Handling', () => {
  
  // 登录辅助函数
  async function loginAsAdmin(page) {
    await page.goto('/admin/login.html');
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin/dashboard.php');
  }

  // 模拟会话过期的辅助函数
  async function simulateSessionExpiry(page) {
    // 通过直接访问API来清除会话
    await page.request.get('/api/logout.php');
  }

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    // 导航到产品管理页面
    await page.locator('a[data-section="products"]').first().click();
    await page.waitForLoadState('networkidle');
  });

  test('should handle session expiry on product archive operation', async ({ page }) => {
    // 模拟会话过期
    await simulateSessionExpiry(page);
    
    // 监听网络请求
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/products.php') && response.status() === 401
    );
    
    // 尝试归档产品 - 检查是否有产品可以操作
    const productRows = page.locator('#products-table-body tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      // 点击第一个产品的归档按钮
      const archiveBtn = page.locator('#products-table-body tr:first-child .archive-btn').first();
      if (await archiveBtn.isVisible()) {
        // 点击确认对话框的确定按钮
        page.on('dialog', dialog => dialog.accept());
        await archiveBtn.click();
        
        // 等待401响应
        await responsePromise;
        
        // 验证会话过期提示
        const toast = page.locator('#toast-notification');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('您的登录已过期，将自动跳转到登录页面');
        
        // 等待重定向到登录页面
        await page.waitForURL('**/admin/login.html', { timeout: 5000 });
        await expect(page.locator('input[name="username"]')).toBeVisible();
      }
    }
  });

  test('should handle session expiry on bulk archive operation', async ({ page }) => {
    // 模拟会话过期
    await simulateSessionExpiry(page);
    
    // 检查是否有产品可以操作
    const productRows = page.locator('#products-table-body tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      // 选择第一个产品
      await page.locator('#products-table-body tr:first-child .row-checkbox').click();
      
      // 等待批量操作面板显示
      await expect(page.locator('#bulk-actions-panel')).toBeVisible();
      
      // 监听网络请求
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/products.php') && response.status() === 401
      );
      
      // 点击批量归档按钮
      const bulkArchiveBtn = page.locator('#bulk-archive-btn');
      if (await bulkArchiveBtn.isVisible()) {
        // 点击确认对话框的确定按钮
        page.on('dialog', dialog => dialog.accept());
        await bulkArchiveBtn.click();
        
        // 等待401响应
        await responsePromise;
        
        // 验证会话过期提示
        const toast = page.locator('#toast-notification');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('您的登录已过期，将自动跳转到登录页面');
        
        // 等待重定向到登录页面
        await page.waitForURL('**/admin/login.html', { timeout: 5000 });
      }
    }
  });

  test('should handle session expiry on product deletion', async ({ page }) => {
    // 模拟会话过期
    await simulateSessionExpiry(page);
    
    // 检查是否有产品可以操作
    const productRows = page.locator('#products-table-body tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      // 监听网络请求
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/products.php') && response.status() === 401
      );
      
      // 点击第一个产品的删除按钮
      const deleteBtn = page.locator('#products-table-body tr:first-child .delete-btn').first();
      if (await deleteBtn.isVisible()) {
        // 点击确认对话框的确定按钮
        page.on('dialog', dialog => dialog.accept());
        await deleteBtn.click();
        
        // 等待401响应
        await responsePromise;
        
        // 验证会话过期提示
        const toast = page.locator('#toast-notification');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('您的登录已过期，将自动跳转到登录页面');
        
        // 等待重定向到登录页面
        await page.waitForURL('**/admin/login.html', { timeout: 5000 });
      }
    }
  });

  test('should handle session expiry on product form submission', async ({ page }) => {
    // 模拟会话过期
    await simulateSessionExpiry(page);
    
    // 打开添加产品表单
    await page.locator('#add-product-btn').click();
    await expect(page.locator('#product-form-section')).toBeVisible();
    
    // 填写表单
    await page.locator('#name').fill('测试产品');
    await page.locator('#category').selectOption('测试分类');
    await page.locator('#description').fill('这是一个测试产品描述');
    
    // 监听网络请求
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/products.php') && response.status() === 401
    );
    
    // 提交表单
    await page.locator('button[type="submit"]').click();
    
    // 等待401响应
    await responsePromise;
    
    // 验证会话过期提示
    const toast = page.locator('#toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('您的登录已过期，将自动跳转到登录页面');
    
    // 等待重定向到登录页面
    await page.waitForURL('**/admin/login.html', { timeout: 5000 });
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('should handle session expiry on bulk deletion', async ({ page }) => {
    // 模拟会话过期
    await simulateSessionExpiry(page);
    
    // 检查是否有产品可以操作
    const productRows = page.locator('#products-table-body tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      // 选择第一个产品
      await page.locator('#products-table-body tr:first-child .row-checkbox').click();
      
      // 等待批量操作面板显示
      await expect(page.locator('#bulk-actions-panel')).toBeVisible();
      
      // 监听网络请求
      const responsePromise = page.waitForResponse(response => 
        response.url().includes('/api/products.php') && response.status() === 401
      );
      
      // 点击批量删除按钮
      const bulkDeleteBtn = page.locator('#bulk-delete-btn');
      if (await bulkDeleteBtn.isVisible()) {
        // 点击确认对话框的确定按钮
        page.on('dialog', dialog => dialog.accept());
        await bulkDeleteBtn.click();
        
        // 等待401响应
        await responsePromise;
        
        // 验证会话过期提示
        const toast = page.locator('#toast-notification');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('您的登录已过期，将自动跳转到登录页面');
        
        // 等待重定向到登录页面
        await page.waitForURL('**/admin/login.html', { timeout: 5000 });
      }
    }
  });

  test('should maintain session for authorized operations', async ({ page }) => {
    // 不模拟会话过期，确保正常操作仍然有效
    
    // 打开添加产品表单
    await page.locator('#add-product-btn').click();
    await expect(page.locator('#product-form-section')).toBeVisible();
    
    // 填写表单
    await page.locator('#name').fill('正常测试产品');
    await page.locator('#description').fill('这是一个正常的测试产品');
    
    // 检查分类选项是否可用
    const categoryOptions = page.locator('#category option');
    const optionCount = await categoryOptions.count();
    if (optionCount > 0) {
      await page.locator('#category').selectOption({ index: 0 });
    }
    
    // 监听成功的网络请求
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/products.php') && response.status() === 200
    );
    
    // 提交表单
    await page.locator('button[type="submit"]').click();
    
    // 等待成功响应
    await responsePromise;
    
    // 验证成功消息
    const toast = page.locator('#toast-notification');
    await expect(toast).toBeVisible();
    await expect(toast).toContainText('成功');
    
    // 确保仍在dashboard页面
    await expect(page.locator('.sidebar-logo')).toBeVisible();
  });

  test('should properly handle toast notification timing', async ({ page }) => {
    // 验证toast通知的显示时间
    
    // 模拟会话过期
    await simulateSessionExpiry(page);
    
    // 检查是否有产品可以操作
    const productRows = page.locator('#products-table-body tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      // 点击第一个产品的归档按钮
      const archiveBtn = page.locator('#products-table-body tr:first-child .archive-btn').first();
      if (await archiveBtn.isVisible()) {
        page.on('dialog', dialog => dialog.accept());
        await archiveBtn.click();
        
        // 验证toast显示
        const toast = page.locator('#toast-notification');
        await expect(toast).toBeVisible();
        await expect(toast).toContainText('您的登录已过期');
        
        // 记录开始时间
        const startTime = Date.now();
        
        // 等待重定向
        await page.waitForURL('**/admin/login.html', { timeout: 5000 });
        
        // 验证重定向时间在合理范围内（2-4秒）
        const redirectTime = Date.now() - startTime;
        expect(redirectTime).toBeGreaterThan(2000); // 至少2秒
        expect(redirectTime).toBeLessThan(4000);    // 不超过4秒
      }
    }
  });
});