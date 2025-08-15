<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>添加新产品</title>
    <link rel="stylesheet" href="assets/css/admin_style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <script>
    fetch('../api/check_session.php').then(r=>r.json()).then(d=>{ if(!d.loggedIn){ location.href='login.html'; }}).catch(()=>location.href='login.html');
    </script>
    <main class="main-content">
        <header class="main-header">
            <h2><i class="fas fa-plus"></i> 添加新产品</h2>
            <div class="header-actions">
                <a class="btn btn-secondary" href="dashboard.php"><i class="fas fa-arrow-left"></i> 返回列表</a>
            </div>
        </header>

        <section id="product-form-section" class="form-section">
            <h3 id="form-title" style="margin-top:0">添加新产品</h3>
            <form id="product-form">
                <input type="hidden" id="product-id" name="id">
                <input type="hidden" id="variants-meta" name="variants_meta" value="">
                <div class="form-row">
                    <div class="form-group">
                        <label for="name">产品名称</label>
                        <input type="text" id="name" name="name" class="form-control" required>
                    </div>
                    <div class="form-group">
                        <label for="category">产品分类</label>
                        <select id="category" name="category" class="form-control" required></select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="material">材质</label>
                        <select id="material" name="material" class="form-control" required>
                            <option value="">请选择材质</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="variant-name">颜色</label>
                        <select id="variant-name" name="color" class="form-control" required>
                            <option value="">请选择颜色</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="description">产品描述</label>
                    <textarea id="description" name="description" rows="4" class="form-control" required placeholder="描述产品的特点、材质、设计理念等..."></textarea>
                </div>
                <div class="form-group">
                    <label for="media">产品媒体</label>
                    <div id="current-media-previews" class="media-previews media-sortable" aria-label="媒体列表（可拖拽排序）">
                        <div class="upload-dropzone" id="media-dropzone" role="button" tabindex="0" aria-label="添加图片" data-use-native="1">
                            <label for="media" class="plus" style="cursor:pointer;display:flex;align-items:center;justify-content:center;width:100%;height:100%">+</label>
                            <input type="file" id="media" name="media[]" class="dropzone-input" multiple accept="image/*">
                        </div>
                    </div>
                    <small class="form-text">注意：列表中的第一张图片将作为产品封面。</small>
                </div>
                <div class="form-group">
                    <label>同组颜色</label>
                    <div id="siblings-panel" class="variants-container compact" style="display:flex;gap:6px;flex-wrap:wrap">
                        <!-- Existing sibling chips will be rendered here -->
                        <div class="upload-dropzone add-variant-dropzone" id="add-variant-row" role="button" tabindex="0" aria-label="添加颜色">
                            <span class="plus">+</span>
                        </div>
                    </div>
                    <small class="form-text">点击任一颜色卡片可快速切换到该颜色进行编辑。点击 [+] 添加新的颜色变体。</small>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> 保存产品</button>
                    <a href="dashboard.php" class="btn btn-secondary"><i class="fas fa-times"></i> 取消</a>
                </div>
            </form>
        </section>
    </main>

    <?php include 'components/modals.php'; ?>

    <script type="module">
        import EventBus from './assets/js/EventBus.js';
        import ProductFormComponent from './assets/js/components/ProductFormComponent.js';
        import ToastComponent from './assets/js/components/ToastComponent.js';
        // 仅初始化表单与通知
        const eventBus = new EventBus();
        new ToastComponent('#toast-notification', eventBus);
        const formComp = new ProductFormComponent('#product-form-section', eventBus);
        // 若带有 ?id= 则加载为“编辑模式”
        const sp = new URLSearchParams(location.search);
        const id = sp.get('id');
        if (id) {
            // 使用组件的 show_form 进入编辑模式
            formComp.show_form({ id: id });
        }
    </script>
</body>
</html>


