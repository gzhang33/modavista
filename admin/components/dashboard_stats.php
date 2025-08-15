<section id="dashboard-stats-section" class="content-section active" data-section="dashboard">
    <header class="main-header">
        <h2><i class="fas fa-chart-line"></i> 展示统计概览</h2>
        <div class="header-actions">
            <button id="refresh-stats" class="btn btn-secondary">
                <i class="fas fa-sync-alt"></i> 刷新数据
            </button>
            <button id="btn-add-chart" class="btn btn-secondary">+ 添加图表</button>
            <button id="btn-clear-layout" class="btn btn-secondary">清空布局</button>
        </div>
    </header>

    <!-- 统计区域改为统一网格卡片，由 JS 组件渲染 -->
    <div class="widget" style="margin-top:12px;">
        <div class="widget-content" style="padding: 0;">
            <section class="grid-stack" id="analytics-grid"></section>
        </div>
    </div>

    

    <!-- 添加图表模态框 -->
    <div id="chart-modal" class="modal" aria-hidden="true" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.35);align-items:center;justify-content:center;">
      <div class="modal-panel" style="width:420px;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.15);">
        <div class="modal-header" style="padding:12px 14px;border-bottom:1px solid #edf2f7;font-weight:600;">添加图表</div>
        <div class="modal-body" style="padding:12px 14px;display:grid;gap:10px;">
          <div class="field" style="display:grid;gap:6px;">
            <label for="dataset_type">数据类型</label>
            <select id="dataset_type">
              <option value="products_per_category">按分类统计产品</option>
              <option value="new_products_over_time">按月份统计新增产品</option>
            </select>
          </div>
          <div class="field" style="display:grid;gap:6px;">
            <label for="chart_type">图表类型（推荐已自动选择）</label>
            <select id="chart_type">
              <option value="pie">饼图</option>
              <option value="bar">柱状图</option>
              <option value="line">折线图</option>
            </select>
          </div>
          <div class="field" style="display:grid;gap:6px;">
            <label for="chart_title">图表标题（可选）</label>
            <input id="chart_title" class="input" placeholder="例如：各分类产品数" />
          </div>
        </div>
        <div class="modal-footer" style="padding:12px 14px;border-top:1px solid #edf2f7;display:flex;justify-content:flex-end;gap:10px;">
          <button id="btn-cancel" class="btn">取消</button>
          <button id="btn-confirm" class="btn">添加到仪表盘</button>
        </div>
      </div>
    </div>
</section>