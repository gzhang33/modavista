// test/admin_dashboard.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Admin Dashboard', () => {
  
  // 登录辅助函数
  async function loginAsAdmin(page) {
    await page.goto('/admin/login.html');
    await page.locator('input[name="username"]').fill('admin');
    await page.locator('input[name="password"]').fill('admin');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/admin/dashboard.php');
  }

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display main dashboard elements', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/展示管理后台/);

    // 验证侧边栏是否存在
    await expect(page.locator('.sidebar')).toBeVisible();
    await expect(page.locator('.sidebar-logo')).toContainText('展示管理');

    // 验证主要导航项
    await expect(page.locator('a[data-section="dashboard"]')).toBeVisible();
    await expect(page.locator('a[data-section="products"]')).toBeVisible();
    await expect(page.locator('#logout-link')).toBeVisible();

    // 验证主内容区域
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('should display dashboard stats section', async ({ page }) => {
    // 验证统计概览部分
    await expect(page.locator('#dashboard-stats-section')).toBeVisible();
    await expect(page.locator('h2:has-text("展示统计概览")')).toBeVisible();

    // 验证统计卡片
    await expect(page.locator('#total-products')).toBeVisible();
    await expect(page.locator('#total-views')).toBeVisible();
    await expect(page.locator('#total-categories')).toBeVisible();
    await expect(page.locator('#total-media')).toBeVisible();

    // 验证刷新按钮
    await expect(page.locator('#refresh-stats')).toBeVisible();

    // 验证热门产品和分类分布部分
    await expect(page.locator('#popular-products')).toBeVisible();
    await expect(page.locator('#category-distribution')).toBeVisible();
    await expect(page.locator('#recent-activities')).toBeVisible();
  });

  test('should navigate to products management section', async ({ page }) => {
    // 点击产品管理导航
    await page.locator('a[data-section="products"]').first().click();
    
    // 等待产品管理部分显示
    await expect(page.locator('#products-management-section')).toBeVisible();
    await expect(page.locator('h2:has-text("产品展示管理")')).toBeVisible();

    // 验证添加产品按钮
    await expect(page.locator('#add-product-btn')).toBeVisible();

    // 验证产品列表相关元素
    await expect(page.locator('#products-table')).toBeVisible();
    await expect(page.locator('#select-all-checkbox')).toBeVisible();
  });

  test('should show product form when add product button is clicked', async ({ page }) => {
    // 先导航到产品管理
    await page.locator('a[data-section="products"]').first().click();
    
    // 点击添加产品按钮
    await page.locator('#add-product-btn').click();

    // 验证表单是否显示
    await expect(page.locator('#product-form-section')).toBeVisible();
    await expect(page.locator('#form-title')).toContainText('添加新产品');

    // 验证表单字段
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#category')).toBeVisible();
    await expect(page.locator('#description')).toBeVisible();
    await expect(page.locator('#media')).toBeVisible();

    // 验证表单按钮
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('#cancel-edit-btn')).toBeVisible();
  });

  test('should cancel product form', async ({ page }) => {
    // 导航到产品管理并打开表单
    await page.locator('a[data-section="products"]').first().click();
    await page.locator('#add-product-btn').click();
    
    // 确认表单可见
    await expect(page.locator('#product-form-section')).toBeVisible();
    
    // 点击取消按钮
    await page.locator('#cancel-edit-btn').click();
    
    // 验证表单被隐藏
    await expect(page.locator('#product-form-section')).not.toBeVisible();
  });

  test('should navigate between current and archived products', async ({ page }) => {
    // 导航到产品管理
    await page.locator('a[data-section="products"]').first().click();
    
    // 点击当前商品
    await page.locator('#current_products_nav').click();
    await expect(page.getByText('当前商品')).toBeVisible();
    
    // 点击归档商品
    await page.locator('#archived_products_nav').click();
    await expect(page.getByText('归档商品')).toBeVisible();
  });

  test('should display bulk actions panel when products are selected', async ({ page }) => {
    // 导航到产品管理
    await page.locator('a[data-section="products"]').first().click();
    
    // 等待产品表格加载
    await page.waitForLoadState('networkidle');
    
    // 检查是否有产品行存在
    const productRows = page.locator('#products-table-body tr');
    const rowCount = await productRows.count();
    
    if (rowCount > 0) {
      // 选择第一个产品
      await page.locator('#products-table-body tr:first-child .row-checkbox').click();
      
      // 验证批量操作面板显示
      await expect(page.locator('#bulk-actions-panel')).toBeVisible();
      await expect(page.locator('#selection-count')).toContainText('已选择');
      
      // 验证批量操作按钮
      await expect(page.locator('#bulk-delete-btn')).toBeVisible();
    }
  });

  test('should refresh dashboard stats', async ({ page }) => {
    // 确保在仪表板页面
    await page.locator('a[data-section="dashboard"]').click();
    
    // 点击刷新按钮
    await page.locator('#refresh-stats').click();
    
    // 等待网络请求完成
    await page.waitForLoadState('networkidle');
    
    // 验证统计数据已加载（检查数字是否不为空）
    const totalProducts = await page.locator('#total-products').textContent();
    expect(totalProducts).not.toBe('');
  });

  test('should handle logout', async ({ page }) => {
    // 点击退出登录
    await page.locator('#logout-link').click();
    
    // 验证重定向到登录页面
    await page.waitForURL('**/admin/login.html');
    await expect(page.locator('input[name="username"]')).toBeVisible();
  });

  test('should validate form inputs', async ({ page }) => {
    // 导航到产品管理并打开表单
    await page.locator('a[data-section="products"]').first().click();
    await page.locator('#add-product-btn').click();
    
    // 尝试提交空表单
    await page.locator('button[type="submit"]').click();
    
    // 验证HTML5表单验证
    const nameField = page.locator('#name');
    const isInvalid = await nameField.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show toast notifications', async ({ page }) => {
    // 验证toast通知容器存在
    await expect(page.locator('#toast-notification')).toBeAttached();
  });

  test('should handle responsive navigation menu', async ({ page }) => {
    // 验证产品管理下拉菜单
    const productMenu = page.locator('#products_management_dropdown');
    await expect(productMenu).toBeVisible();
    
    // 点击产品管理主菜单项
    await page.locator('#products_management_dropdown .nav-link').click();
    
    // 验证子菜单项是否可见
    await expect(page.locator('#current_products_nav')).toBeVisible();
    await expect(page.locator('#archived_products_nav')).toBeVisible();
  });

  test('should display image preview modal', async ({ page }) => {
    // 验证图片预览模态框存在
    await expect(page.locator('#image-preview-modal')).toBeAttached();
    await expect(page.locator('#modal-image')).toBeAttached();
    await expect(page.locator('.close-modal')).toBeAttached();
  });

  test('should load and display products in table', async ({ page }) => {
    // 导航到产品管理
    await page.locator('a[data-section="products"]').first().click();
    
    // 等待产品加载
    await page.waitForLoadState('networkidle');
    
    // 验证产品表格结构
    await expect(page.locator('#products-table')).toBeVisible();
    await expect(page.locator('#products-table thead')).toBeVisible();
    await expect(page.locator('#products-table-body')).toBeVisible();
    
    // 检查表格头部
    await expect(page.locator('#products-table thead')).toContainText('产品名称');
    await expect(page.locator('#products-table thead')).toContainText('分类');
    await expect(page.locator('#products-table thead')).toContainText('状态');
    await expect(page.locator('#products-table thead')).toContainText('操作');
  });

  test('should maintain session and show appropriate content', async ({ page }) => {
    // 验证用户已登录状态的指示器
    await expect(page.locator('.sidebar-logo')).toContainText('展示管理');
    
    // 验证主要功能区域都可访问
    await expect(page.locator('#dashboard-stats-section')).toBeVisible();
    await expect(page.locator('#products-management-section')).toBeAttached();
    
    // 验证退出登录按钮存在（表明用户已登录）
    await expect(page.locator('#logout-link')).toBeVisible();
  });
});