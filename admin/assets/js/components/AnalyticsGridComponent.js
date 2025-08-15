import BaseComponent from './BaseComponent.js';
import apiClient from '/assets/js/utils/apiClient.js';

const STORAGE_KEY = 'dashboard_analytics_layout_v1';

export default class AnalyticsGridComponent extends BaseComponent {
  constructor(selector, eventBus) {
    super(selector, eventBus);
    if (!this.element) return;
    this.cards = new Map();
    this.grid = GridStack.init({
      float: true,
      cellHeight: 140,
      minRow: 1,
      margin: 8,
      disableOneColumnMode: false,
      // 移除网格限制，允许自由拖拽和调整大小
      maxRow: 0, // 0表示无限制
      maxCol: 0, // 0表示无限制
      // 允许更灵活的布局
      acceptWidgets: true,
      // 启用拖拽和调整大小
      draggable: {
        handle: '.gs-card-header'
      },
      resizable: {
        handles: 'all'
      }
    }, document.getElementById('analytics-grid'));

    this.bind_toolbar();
    this.restore_or_seed_layout();
    this.grid.on('change', () => this.save_layout());
    this.grid.on('resizestop', (event, el) => {
      const id = el?.dataset?.cardId;
      const card = id ? this.cards.get(id) : null;
      if (card && card.chart) card.chart.resize();
    });
  }

  bind_toolbar() {
    const modal = document.getElementById('chart-modal');
    const btn_add = document.getElementById('btn-add-chart');
    const btn_clear = document.getElementById('btn-clear-layout');
    const btn_cancel = document.getElementById('btn-cancel');
    const btn_confirm = document.getElementById('btn-confirm');
    const sel_dataset = document.getElementById('dataset_type');
    const sel_chart = document.getElementById('chart_type');
    const input_title = document.getElementById('chart_title');

    const open_modal = () => {
      const rec = this.get_recommended_chart_types(sel_dataset.value);
      sel_chart.value = rec[0];
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden', 'false');
    };
    const close_modal = () => {
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
    };

    btn_add?.addEventListener('click', open_modal);
    btn_cancel?.addEventListener('click', close_modal);
    modal?.addEventListener('click', (e) => { if (e.target === modal) close_modal(); });
    sel_dataset?.addEventListener('change', () => {
      const rec = this.get_recommended_chart_types(sel_dataset.value);
      sel_chart.value = rec[0];
    });
    btn_clear?.addEventListener('click', () => {
      const nodes = this.grid.engine.nodes.slice();
      nodes.forEach(n => this.grid.removeWidget(n.el));
      this.cards.clear();
      localStorage.removeItem(STORAGE_KEY);
    });
    btn_confirm?.addEventListener('click', async () => {
      const config = {
        dataset_type: sel_dataset.value,
        chart_type: sel_chart.value,
        title: input_title.value.trim() || undefined,
      };
      this.add_chart_card(config);
      close_modal();
    });
  }

  get_recommended_chart_types(dataset_type) {
    if (dataset_type === 'products_per_category') return ['pie', 'bar'];
    if (dataset_type === 'new_products_over_time') return ['line', 'bar'];
    return ['bar'];
  }

  get_summary_icon(dataset_type) {
    const icon_map = {
      'products_count': 'fas fa-box',
      'categories_count': 'fas fa-tags',
      'views_count': 'fas fa-eye',
      'media_count': 'fas fa-images',
      'total_products': 'fas fa-boxes',
      'total_categories': 'fas fa-layer-group'
    };
    return icon_map[dataset_type] || 'fas fa-chart-bar';
  }

  get_summary_modifier(dataset_type) {
    const class_map = {
      'products_count': 'gs-summary--products',
      'categories_count': 'gs-summary--categories',
      'views_count': 'gs-summary--views',
      'media_count': 'gs-summary--media',
      'total_products': 'gs-summary--products',
      'total_categories': 'gs-summary--categories'
    };
    return class_map[dataset_type] || '';
  }

  save_layout() {
    const layout = [];
    this.grid.engine.nodes.forEach((n) => {
      const card = this.cards.get(n.el.dataset.cardId);
      if (card) layout.push({ id: n.el.dataset.cardId, x: n.x, y: n.y, w: n.w, h: n.h, config: card.config });
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  }

  restore_or_seed_layout() {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch(e) { saved = []; }
    if (Array.isArray(saved) && saved.length) {
      saved.forEach(item => this._add_from_saved(item));
      return;
    }
    // 默认布局：产品总数、分类总数、最新产品(列表)、分类分布(饼图)
    const defaults = [
      { type: 'summary', config: { dataset_type: 'products_count', chart_type: 'summary', title: '产品总数' }, pos: {x:0,y:0,w:4,h:3} },
      { type: 'summary', config: { dataset_type: 'categories_count', chart_type: 'summary', title: '分类总数' }, pos: {x:4,y:0,w:4,h:3} },
      { type: 'list',    config: { dataset_type: 'latest_products', chart_type: 'list', title: '最新展示产品', limit: 5 }, pos: {x:8,y:0,w:4,h:3} },
      { type: 'chart',   config: { dataset_type: 'category_distribution', chart_type: 'pie', title: '分类分布' }, pos: {x:0,y:3,w:6,h:5} },
    ];
    defaults.forEach(d => this.add_card_by_type(d.type, d.config, d.pos));
  }

  _add_from_saved(item) {
    const el = this.create_card_element(item.id, item.config && item.config.title);
    this.grid.addWidget(el, { x: item.x, y: item.y, w: item.w, h: item.h });
    el.querySelector('.btn-remove').addEventListener('click', () => {
      this.destroy_chart(item.id);
      this.grid.removeWidget(el);
      this.cards.delete(item.id);
      this.save_layout();
    });
    this.render_card(item.id, el, item.config);
    this.cards.set(item.id, { chart: null, config: item.config });
  }

  create_card_element(card_id, title) {
    const el = document.createElement('div');
    el.className = 'grid-stack-item';
    el.dataset.cardId = card_id;
    el.innerHTML = `
      <div class="grid-stack-item-content gs-card">
        <div class="gs-card-header">
          <div class="gs-card-title">
            <i class="fas fa-chart-line" style="margin-right: 0.5rem; color: #667eea;"></i>
            ${title || '未命名图表'}
          </div>
          <div>
            <button class="btn btn-remove" title="移除图表">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        <div class="gs-card-body">
          <div class="loading-indicator" style="display: none;">
            <i class="fas fa-spinner fa-spin" style="color: #667eea; font-size: 1.5rem;"></i>
            <p style="margin-top: 0.5rem; color: #718096;">加载中...</p>
          </div>
          <canvas></canvas>
        </div>
      </div>`;
    return el;
  }

  destroy_chart(card_id) {
    const card = this.cards.get(card_id);
    if (card && card.chart) card.chart.destroy();
  }

  async render_card(card_id, el, config) {
    const canvas = el.querySelector('canvas');
    const loading_indicator = el.querySelector('.loading-indicator');
    
    // 显示加载状态
    if (loading_indicator) loading_indicator.style.display = 'flex';
    if (canvas) canvas.style.display = 'none';
    
    try {
      const params = { type: config.dataset_type };
      if (config.chart_type === 'list') {
        const safe_limit = Number.isFinite(config.limit) && config.limit > 0 ? config.limit : 5;
        params.limit = safe_limit;
      }
      const data = await apiClient.get('/analytics.php', params);
      const items = Array.isArray(data?.items) ? data.items : [];

      // 隐藏加载状态
      if (loading_indicator) loading_indicator.style.display = 'none';
      if (canvas) canvas.style.display = 'block';

      // summary / list / chart 渲染
      if (config.chart_type === 'summary') {
        // 紧凑型统计卡片（含图标）
        if (canvas) {
          const icon_class = this.get_summary_icon(config.dataset_type);
          const type_modifier = this.get_summary_modifier(config.dataset_type);
          const wrapper = el.querySelector('.grid-stack-item-content');
          if (wrapper) wrapper.classList.add('gs-card--flat');
          canvas.parentElement.innerHTML = `
            <div class="gs-summary ${type_modifier}">
              <div class="gs-summary__icon"><i class="${icon_class}"></i></div>
              <div class="gs-summary__content">
                <div class="gs-summary__number">${items[0]?.value ?? 0}</div>
                <div class="gs-summary__label">${config.title || '统计数值'}</div>
              </div>
            </div>
          `;
        }
        this.cards.set(card_id, { chart: null, config });
        return;
      }

      if (config.chart_type === 'list') {
        if (canvas) {
          canvas.parentElement.innerHTML = `
            <div class="list-body">
              ${items.length > 0 ? 
                items.map(p => `
                  <div class="list-item">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <span style="font-weight: 500;">${p.name}</span>
                      <span style="color: #718096; font-size: 0.75rem;">${p.createdAt}</span>
                    </div>
                  </div>
                `).join('') : 
                '<div class="list-empty">暂无数据</div>'
              }
            </div>
          `;
        }
        this.cards.set(card_id, { chart: null, config });
        return;
      }

      if (!canvas) return;
      const labels = items.map(i => i.label);
      const values = items.map(i => i.value);
      const chart_data = {
        labels,
        datasets: [{
          label: config.title || '',
          data: values,
          backgroundColor: labels.map((_, i) => {
            const colors = ['#667eea','#764ba2','#f093fb','#4FD1C5','#63B3ED','#F6AD55','#FC8181','#B794F4','#9AE6B4','#FBD38D'];
            return colors[i % colors.length];
          }),
          borderColor: labels.map((_, i) => {
            const colors = ['#5a67d8','#6b46c1','#d53f8c','#38b2ac','#4299e1','#ed8936','#e53e3e','#9f7aea','#68d391','#f6e05e'];
            return colors[i % colors.length];
          }),
          borderWidth: 2,
          hoverBorderWidth: 3
        }]
      };
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: (config.chart_type === 'bar' || config.chart_type === 'line') ? { 
          y: { 
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            }
          },
          x: {
            grid: {
              color: 'rgba(226, 232, 240, 0.5)'
            }
          }
        } : {},
        plugins: { 
          legend: { 
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          } 
        },
        elements: {
          point: {
            radius: 6,
            hoverRadius: 8
          }
        }
      };
      this.destroy_chart(card_id);
      const chart = new Chart(canvas.getContext('2d'), { type: config.chart_type, data: chart_data, options });
      this.cards.set(card_id, { chart, config });
    } catch (error) {
      console.error('渲染图表失败:', error);
      if (loading_indicator) loading_indicator.style.display = 'none';
      if (canvas) {
        canvas.parentElement.innerHTML = `
          <div style="text-align: center; color: #e53e3e; padding: 2rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>加载失败</p>
            <small>请检查网络连接或稍后重试</small>
          </div>
        `;
      }
      this.cards.set(card_id, { chart: null, config });
    }
  }

  add_chart_card(config, size = { w: 4, h: 3 }) {
    const card_id = `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const el = this.create_card_element(card_id, config.title);
    this.grid.addWidget(el, { x: 0, y: 0, w: size.w, h: size.h });
    el.querySelector('.btn-remove').addEventListener('click', () => {
      this.destroy_chart(card_id);
      this.grid.removeWidget(el);
      this.cards.delete(card_id);
      this.save_layout();
    });
    this.render_card(card_id, el, config).then(() => this.save_layout());
  }

  add_card_by_type(type, config, pos) {
    const card_id = `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const el = this.create_card_element(card_id, config.title);
    this.grid.addWidget(el, { x: pos.x, y: pos.y, w: pos.w, h: pos.h });
    el.querySelector('.btn-remove').addEventListener('click', () => {
      this.destroy_chart(card_id);
      this.grid.removeWidget(el);
      this.cards.delete(card_id);
      this.save_layout();
    });
    this.render_card(card_id, el, config).then(() => this.save_layout());
  }
}


