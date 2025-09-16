<?php require_once '_auth_guard.php'; ?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>筛选</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        @media (min-width: 769px){ body{ display:none; } }
        html, body { height: 100%; overflow: hidden; }
        .filters-page { padding: 1rem; height: 100dvh; display: flex; flex-direction: column; }
        .filters-header { display:flex; align-items:center; justify-content:space-between; padding:0.5rem 0; position:sticky; top:0; background:#fff; z-index:10; border-bottom:1px solid #e5e7eb; }
        #filters-content { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; padding-bottom: 88px; }
        .filters-group { background:#fff; border:1px solid #e5e7eb; border-radius:0.75rem; padding:0.75rem; margin:0.75rem 0; }
        .filters-group h4 { margin:0 0 0.5rem 0; font-size:0.95rem; }
        .filters-options { display:flex; flex-wrap:wrap; gap:0.5rem; }
        .chip { padding:0.4rem 0.75rem; border:1px solid #e5e7eb; border-radius:999px; background:#f8fafc; font-size:0.875rem; cursor:pointer; }
        .chip.active { background:#059669; border-color:#059669; color:#fff; }
        .filters-footer { position: fixed; left:0; right:0; bottom:0; background:#fff; border-top:1px solid #e5e7eb; padding:0.75rem; display:flex; gap:0.75rem; }
        .btn-full { flex:1; justify-content:center; }
    </style>
</head>
<body>
    <div class="filters-page" id="filters-page">
        <div class="filters-header">
            <button id="back-btn" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> 返回</button>
            <div style="font-weight:600">筛选</div>
            <button id="clear-btn" class="btn btn-secondary">清除</button>
        </div>

        <div id="filters-content"></div>

        <div class="filters-footer">
            <button id="apply-btn" class="btn btn-success btn-full"><i class="fas fa-check"></i> 应用</button>
        </div>
    </div>

    <script type="module">
        import apiClient from './assets/js/utils/apiClient.js';

        const content = document.getElementById('filters-content');
        // Determine context by query or referrer
        const url = new URL(location.href);
        const pageCtx = url.searchParams.get('page') || (document.referrer.includes('contact_messages.php') ? 'messages' : 'products');
        const storageKey = pageCtx === 'messages' ? 'admin_mobile_filters_messages' : 'admin_mobile_filters';
        const returnUrl = pageCtx === 'messages' ? 'contact_messages.php#messages' : 'dashboard.php#products';

        function saveFilters(values){ localStorage.setItem(storageKey, JSON.stringify(values)); }
        function loadFilters(){ try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch(_) { return {}; } }

        function buildGroup(title, key, options){
            const wrapper = document.createElement('div');
            wrapper.className = 'filters-group';
            wrapper.innerHTML = `<h4>${title}</h4><div class="filters-options" data-key="${key}"></div>`;
            const box = wrapper.querySelector('.filters-options');
            const selected = new Set((loadFilters()[key] || []));
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'chip';
                btn.textContent = opt;
                if (selected.has(opt)) btn.classList.add('active');
                btn.addEventListener('click', () => {
                    // 单选：同组仅保留一个选项
                    Array.from(box.querySelectorAll('.chip')).forEach(c => c.classList.remove('active'));
                    btn.classList.add('active');
                });
                box.appendChild(btn);
            });
            return wrapper;
        }

        async function init(){
            if (pageCtx === 'products') {
                const [colors, materials, categories] = await Promise.all([
                    apiClient.get('/colors.php', { lang: 'it' }),
                    apiClient.get('/materials.php', { lang: 'it' }),
                    apiClient.get('/categories.php', { lang: 'it' })
                ]);
                content.appendChild(buildGroup('颜色', 'color', (colors||[]).filter(Boolean)));
                content.appendChild(buildGroup('材质', 'material', (materials||[]).filter(Boolean)));
                content.appendChild(buildGroup('分类', 'category', (categories||[]).map(c=>c.name).filter(Boolean)));
                content.appendChild(buildGroup('时间', 'createdAt', ['今天','本周','本月','今年']));
            } else {
                // messages page filters: status + time
                content.appendChild(buildGroup('状态', 'status', ['待定','进行中','完成','未完成']));
                content.appendChild(buildGroup('时间', 'time', ['today','week','month','year']));
            }
        }

        document.getElementById('back-btn').onclick = () => history.back();
        document.getElementById('clear-btn').onclick = () => { localStorage.removeItem(storageKey); location.href = returnUrl; };
        content.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip');
            if (!chip) return;
            const box = chip.parentElement;
            Array.from(box.querySelectorAll('.chip')).forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
        document.getElementById('apply-btn').onclick = () => {
            const values = {};
            document.querySelectorAll('.filters-options').forEach(box => {
                const key = box.getAttribute('data-key');
                const selected = Array.from(box.querySelectorAll('.chip.active')).map(n=>n.textContent);
                if (selected.length) values[key] = selected;
            });
            saveFilters(values);
            location.href = returnUrl;
        };

        init();
    </script>
</body>
</html>


