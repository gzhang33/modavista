/**
 * API 客户端工具类
 * 提供统一的 API 请求接口，用于处理所有后端数据交互
 */
class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.defaultHeaders = {
      'Content-Type': 'application/json'
    };
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
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Risorsa non trovata');
        } else if (response.status >= 500) {
          throw new Error('Errore del server');
        } else {
          throw new Error(`Errore HTTP ${response.status}: ${response.statusText}`);
        }
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
    const options = {
      method: 'POST'
    };

    if (data instanceof FormData) {
      // FormData 请求不需要设置 Content-Type
      delete this.defaultHeaders['Content-Type'];
      options.body = data;
    } else {
      options.body = JSON.stringify(data);
      options.headers = { ...this.defaultHeaders };
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
    return this.get('/products.php', { category: encodeURIComponent(category) });
  }

  /**
   * 获取所有产品分类
   * @returns {Promise<Array>} 分类列表
   */
  async getCategories() {
    return this.get('/categories.php');
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
    return this.put('/products.php', productData);
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