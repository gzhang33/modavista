// htdocs/admin/assets/js/utils/apiClient.js
import SessionManager from './sessionManager.js';

class ApiClient {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.sessionManager = null;
    }
    
    setSessionManager(sessionManager) {
        this.sessionManager = sessionManager;
    }

    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
                ...options.headers
            },
            ...options
        };

        // 添加查询参数
        if (options.params) {
            const params = new URLSearchParams();
            Object.keys(options.params).forEach(key => {
                if (options.params[key] !== undefined && options.params[key] !== null) {
                    params.append(key, options.params[key]);
                }
            });
            
            const queryString = params.toString();
            if (queryString) {
                const separator = url.includes('?') ? '&' : '?';
                config.url = `${url}${separator}${queryString}`;
            } else {
                config.url = url;
            }
        } else {
            config.url = url;
        }

        try {
            const response = await fetch(config.url, {
                method: config.method || 'GET',
                headers: config.headers,
                body: config.body,
                credentials: 'include' // 确保发送cookies
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // 检查是否是会话过期
                    try {
                        const errorData = await response.json();
                        if (errorData.session_expired) {
                            // 通知会话管理器处理会话过期
                            if (this.sessionManager) {
                                this.sessionManager.handleSessionExpired(errorData);
                            }
                            throw new Error('SESSION_EXPIRED');
                        }
                    } catch (e) {
                        // JSON解析失败，使用默认处理
                    }
                    throw new Error('SESSION_EXPIRED');
                }
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.response = response;
                throw error;
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            if (error.message === 'SESSION_EXPIRED') {
                throw error;
            }
            throw new Error(`网络请求失败: ${error.message}`);
        }
    }

    async get(endpoint, params = {}) {
        return this.request(endpoint, { method: 'GET', params });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // 获取分类（支持语言参数和Admin模式）
    async getCategories(lang = 'en', adminMode = false) {
        try {
            const params = { lang };
            if (adminMode) {
                params.admin = '1';
            }
            const response = await this.get('/categories.php', params);
            
            if (adminMode && response.categories) {
                // Admin模式：返回完整数据和映射
                return response;
            }
            
            // 普通模式：返回分类数组
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('获取分类失败:', error);
            return adminMode ? { categories: [], mapping: {} } : [];
        }
    }

    // 获取材质（支持语言参数和Admin模式）
    async getMaterials(lang = 'en', adminMode = false) {
        try {
            const params = { lang };
            if (adminMode) {
                params.admin = '1';
            }
            const response = await this.get('/materials.php', params);
            
            if (adminMode && response.materials) {
                // Admin模式：返回完整数据和映射
                return response;
            }
            
            // 普通模式：返回材质数组
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('获取材质失败:', error);
            return adminMode ? { materials: [], mapping: {} } : [];
        }
    }

    // 获取颜色（支持语言参数和Admin模式）
    async getColors(lang = 'en', adminMode = false) {
        try {
            const params = { lang };
            if (adminMode) {
                params.admin = '1';
            }
            const response = await this.get('/colors.php', params);
            
            if (adminMode && response.colors) {
                // Admin模式：返回完整数据和映射
                return response;
            }
            
            // 普通模式：返回颜色数组
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error('获取颜色失败:', error);
            return adminMode ? { colors: [], mapping: {} } : [];
        }
    }

    // 获取季节（支持语言参数和Admin模式）
    async getSeasons(lang = 'en', adminMode = false) {
        try {
            const params = { lang };
            if (adminMode) {
                params.admin = '1';
            }
            const response = await this.get('/seasons.php', params);
            
            if (adminMode && response.seasons) {
                // Admin模式：返回完整数据和映射
                return response;
            }
            
            // 普通模式：返回季节数组
            return Array.isArray(response) ? response.map(s => s.name) : [];
        } catch (error) {
            console.error('获取季节失败:', error);
            return adminMode ? { seasons: [], mapping: {} } : [];
        }
    }
}

// 创建单例实例
const apiClient = new ApiClient('../api');

export default apiClient;