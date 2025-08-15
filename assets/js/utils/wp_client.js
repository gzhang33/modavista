/**
 * WPClient
 * Headless WordPress client for B2B products (Mode C)
 */
export class WPClient {
  constructor(base_url = '/wp/wp-json') {
    this.base_url = base_url;
    this.timeout_ms = 15000;
  }

  async _request(path, params = {}) {
    const url = new URL(this.base_url + path, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout_ms);
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) {
      throw new Error(`WP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  }

  async get_products(filters = {}) {
    return this._request('/b2b/v1/products', filters);
  }

  async get_product(id) {
    return this._request('/b2b/v1/product', { id });
  }

  async get_categories() {
    return this._request('/b2b/v1/categories');
  }
}

const wpClient = new WPClient();
export default wpClient;





