/**
 * API 客户端工具类
 * 提供统一的 API 请求接口，用于处理所有后端数据交互
 */
class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.defaultHeaders = { };
    this.timeout = 15000;
    this._categories_cache = null;
    this._categories_cache_at = 0;
    this._cache_ttl_ms = 5 * 60 * 1000;
  }

  /**
   * 发送 HTTP 请求的基础方法
   * @param {string} endpoint - API 端点
   * @param {Object} options - 请求选项
   * @returns {Promise<any>} API 响应数据
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options
    };

    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeout);
      const response = await fetch(url, { ...config, signal: controller.signal });
      clearTimeout(id);
      
      if (!response.ok) {
        const message = response.status === 401 ? '未授权或会话已过期'
          : response.status === 404 ? '资源未找到'
          : response.status >= 500 ? '服务器错误'
          : `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(message);
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      if (error?.name === 'AbortError') {
        throw new Error('请求超时');
      }
      throw error;
    }
  }

  /**
   * GET 请求
   * @param {string} endpoint - API 端点
   * @param {Object} params - 查询参数
   * @returns {Promise<any>} API 响应数据
   */
  async get(endpoint, params = {}) {
    const searchParams = new URLSearchParams(params);
    const url = searchParams.toString() ? `${endpoint}?${searchParams}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  /**
   * POST 请求
   * @param {string} endpoint - API 端点
   * @param {any} data - 请求数据
   * @returns {Promise<any>} API 响应数据
   */
  async post(endpoint, data) {
    const options = { method: 'POST' };
    if (data instanceof FormData) {
      options.body = data; // 让浏览器自动设置 multipart 边界
    } else {
      options.body = JSON.stringify(data);
      options.headers = { 'Content-Type': 'application/json' };
    }
    return this.request(endpoint, options);
  }

  /**
   * PUT 请求
   * @param {string} endpoint - API 端点
   * @param {any} data - 请求数据
   * @returns {Promise<any>} API 响应数据
   */
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  }

  /**
   * DELETE 请求
   * @param {string} endpoint - API 端点
   * @returns {Promise<any>} API 响应数据
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // === 产品相关的 API 方法 ===

  /**
   * 获取所有产品
   * @param {Object} filters - 过滤条件
   * @returns {Promise<Array>} 产品列表
   */
  async getProducts(filters = {}) {
    return this.get('/products.php', filters);
  }

  /**
   * 根据 ID 获取单个产品
   * @param {string} productId - 产品 ID
   * @returns {Promise<Object>} 产品详情
   */
  async getProduct(productId) {
    return this.get('/products.php', { id: productId });
  }

  /**
   * 根据分类获取产品
   * @param {string} category - 产品分类
   * @returns {Promise<Array>} 该分类下的产品列表
   */
  async getProductsByCategory(category) {
    // 直接传原始分类名，避免重复编码
    return this.get('/products.php', { category });
  }

  /**
   * 获取所有产品分类
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    const now = Date.now();
    if (this._categories_cache && (now - this._categories_cache_at) < this._cache_ttl_ms) {
      return this._categories_cache;
    }
    const data = await this.get('/categories.php');
    if (Array.isArray(data)) {
      this._categories_cache = data;
      this._categories_cache_at = now;
    }
    return data;
  }

  /**
   * 获取所有材质
   * @returns {Promise<Array>} 材质列表
   */
  async getMaterials() {
    const data = await this.get('/materials.php');
    return data;
  }

  /**
   * 获取所有颜色
   * @returns {Promise<Array>} 颜色列表
   */
  async getColors() {
    const data = await this.get('/colors.php');
    return data;
  }

  /**
   * 获取分析数据
   * @param {Object} params - { type: string }
   * @returns {Promise<any>}
   */
  async getAnalytics(params = {}) {
    return this.get('/analytics.php', params);
  }

  /**
   * 创建新产品（管理员功能）
   * @param {FormData} productData - 产品数据和文件
   * @returns {Promise<Object>} 创建结果
   */
  async createProduct(productData) {
    return this.post('/products.php', productData);
  }

  /**
   * 更新产品（管理员功能）
   * @param {string} productId - 产品 ID
   * @param {FormData} productData - 更新的产品数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateProduct(productId, productData) {
    productData.append('id', productId);
    // 后端以 POST 处理更新
    return this.post('/products.php', productData);
  }

  /**
   * 删除产品（管理员功能）
   * @param {string} productId - 产品 ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteProduct(productId) {
    return this.delete(`/products.php?id=${productId}`);
  }

  // === 辅助方法 ===

  /**
   * 检查网络连接状态
   * @returns {boolean} 是否在线
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * 设置请求超时时间
   * @param {number} timeout - 超时时间（毫秒）
   */
  setTimeout(timeout) {
    this.timeout = timeout;
  }

  /**
   * 添加请求拦截器
   * @param {Function} interceptor - 拦截器函数
   */
  addRequestInterceptor(interceptor) {
    // 可以扩展以支持请求拦截
    this.requestInterceptor = interceptor;
  }
}

// 创建单例实例
const apiClient = new ApiClient();

// 导出单例实例和类
export default apiClient;
export { ApiClient };