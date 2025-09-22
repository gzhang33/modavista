// htdocs/admin/assets/js/utils/apiClient.js
import SessionManager from "./sessionManager.js";

class ApiClient {
    constructor(baseURL = "") {
        this.baseURL = baseURL;
        this.sessionManager = null;
    }
    
    setSessionManager(sessionManager) {
        this.sessionManager = sessionManager;
    }

    async request(endpoint, options = {}) {
        const url = endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`;
        
        const config = {
            headers: {
                ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
                ...options.headers
            },
            ...options
        };

        // ??????
        if (options.params) {
            const params = new URLSearchParams();
            Object.keys(options.params).forEach(key => {
                if (options.params[key] !== undefined && options.params[key] !== null) {
                    params.append(key, options.params[key]);
                }
            });
            
            const queryString = params.toString();
            if (queryString) {
                const separator = url.includes("?") ? "&" : "?";
                config.url = `${url}${separator}${queryString}`;
            } else {
                config.url = url;
            }
        } else {
            config.url = url;
        }

        try {
            const response = await fetch(config.url, {
                method: config.method || "GET",
                headers: config.headers,
                body: config.body,
                credentials: "include" // ?? cookies
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // ????????
                    try {
                        const errorData = await response.json();
                        if (errorData.session_expired) {
                            // ???????????
                            if (this.sessionManager) {
                                this.sessionManager.handleSessionExpired(errorData);
                            }
                            throw new Error("SESSION_EXPIRED");
                        }
                    } catch (e) {
                        // JSON ???????????????
                    }
                    throw new Error("SESSION_EXPIRED");
                }
                const error = new Error(`HTTP error! status: ${response.status}`);
                error.response = response;
                throw error;
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return await response.json();
            } else {
                return await response.text();
            }
        } catch (error) {
            if (error.message === "SESSION_EXPIRED") {
                throw error;
            }
            if (error.response) {
                const wrappedError = new Error(`????: ${error.message}`);
                wrappedError.response = error.response;
                throw wrappedError;
            }
            throw new Error(`????: ${error.message}`);
        }
    }

    async get(endpoint, params = {}) {
        return this.request(endpoint, { method: "GET", params });
    }

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: "POST",
            body: data instanceof FormData ? data : JSON.stringify(data)
        });
    }

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: "PUT",
            body: JSON.stringify(data)
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: "DELETE" });
    }

    // ??????? Admin ???
    async getCategories(lang = "en", adminMode = false) {
        try {
            const params = { lang };
            if (adminMode) {
                params.admin = "1";
            }
            const response = await this.get("/categories.php", params);
            
            if (adminMode && response.categories) {
                // Admin ???????????
                return response;
            }
            
            // ?????????
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error("??????:", error);
            return adminMode ? { categories: [], mapping: {} } : [];
        }
    }

    // ??????? Admin ???
    async getMaterials(lang = "en", adminMode = false) {
        try {
            const params = { lang };
            if (adminMode) {
                params.admin = "1";
            }
            const response = await this.get("/materials.php", params);
            
            if (adminMode && response.materials) {
                // Admin ???????????
                return response;
            }
            
            // ?????????
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error("??????:", error);
            return adminMode ? { materials: [], mapping: {} } : [];
        }
    }

    // ??????? Admin ???
    async getColors(lang = "en", adminMode = false) {
        try {
            const params = { lang };
            if (adminMode) {
                params.admin = "1";
            }
            const response = await this.get("/colors.php", params);
            
            if (adminMode && response.colors) {
                // Admin ???????????
                return response;
            }
            
            // ?????????
            return Array.isArray(response) ? response : [];
        } catch (error) {
            console.error("??????:", error);
            return adminMode ? { colors: [], mapping: {} } : [];
        }
    }

    // ??????? Admin ???
    async getSeasons(lang = "en", adminMode = false) {
        try {
            const params = { lang };
            if (adminMode) {
                params.admin = "1";
            }
            const response = await this.get("/seasons.php", params);
            
            if (adminMode && response.seasons) {
                // Admin ???????????
                return response;
            }
            
            // ?????????
            return Array.isArray(response) ? response.map(s => s.name) : [];
        } catch (error) {
            console.error("??????:", error);
            return adminMode ? { seasons: [], mapping: {} } : [];
        }
    }
}

// ????
const apiClient = new ApiClient("../api");

export default apiClient;
