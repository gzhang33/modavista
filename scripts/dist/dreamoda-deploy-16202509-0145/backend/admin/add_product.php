<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>添加新产品</title>
    <link rel="stylesheet" href="assets/css/base.css">
    <link rel="stylesheet" href="assets/css/add_product.css">
    <link rel="stylesheet" href="assets/css/translation.css">
    <link rel="stylesheet" href="assets/css/contact_messages.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <script>
    fetch('../api/check_session.php')
        .then(r=>r.json())
        .then(d=>{ 
            if(!d.loggedIn){ 
                console.log('Session check failed, redirecting to login');
                location.href='login.html'; 
            } else {
                console.log('Session valid, loading page');
            }
        })
        .catch((error)=>{
            console.error('Session check error:', error);
            location.href='login.html';
        });
    </script>
    
    <div class="dashboard-container">
        <main class="main-content">
        <header class="main-header">
            <h2><i class="fas fa-plus"></i> 添加新产品</h2>
            <div class="header-actions">
                <a class="btn btn-secondary" href="dashboard.php"><i class="fas fa-arrow-left"></i> 返回列表</a>
            </div>
        </header>

        <!-- Toast Notification -->
        <div id="toast-notification" class="toast"></div>

        <section id="product-form-section" class="form-section">
            <h3 id="form-title" style="margin-top:0">添加新产品</h3>
            <form id="product-form">
                <input type="hidden" id="product-id" name="id">
                
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
                        <label for="season">季节</label>
                        <select id="season" name="season" class="form-control" required>
                            <option value="">请选择季节</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="color">颜色</label>
                        <select id="color" name="color" class="form-control" required>
                            <option value="">请选择颜色</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <!-- 占位符，保持布局平衡 -->
                    </div>
                </div>
                <!-- <div class="form-group">
                    <label for="description">产品描述</label>
                    <textarea id="description" name="description" rows="4" class="form-control" required placeholder="描述产品的特点、材质、设计理念等..."></textarea>
                </div> -->
                
                <!-- 翻译组件占位符 -->
                <div id="translation-component" class="translation-container"></div>
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
                    <div id="siblings-panel" class="variants variants--compact" role="listbox" aria-label="同组颜色列表">
                        <!-- Existing sibling chips will be rendered here -->
                        <div class="variants__dropzone variants__dropzone--add" id="add-variant-row" role="button" tabindex="0" aria-label="添加颜色">
                            <span class="plus" aria-hidden="true">+</span>
                        </div>
                    </div>
                    <small class="form-text">点击任一颜色卡片可快速切换到该颜色进行编辑。点击 [+] 添加新的颜色变体。</small>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-success"><i class="fas fa-save"></i> 保存产品</button>
                    <a href="dashboard.php" class="btn btn-secondary"><i class="fas fa-times"></i> 取消</a>
                </div>
                <div id="upload-progress" class="upload-progress" aria-live="polite" style="display:none;margin-top:8px">
                    <div class="upload-progress__bar" style="height:6px;background:#e5e7eb;border-radius:4px;overflow:hidden">
                        <div class="upload-progress__bar-inner" style="height:100%;width:0;background:#16a34a;transition:width .2s ease"></div>
                    </div>
                    <div class="upload-progress__text" style="font-size:12px;color:#6b7280;margin-top:4px">准备上传…</div>
                </div>
            </form>
        </section>
        </main>
    </div>



    <script type="module">
        import EventBus from './assets/js/EventBus.js';
        import ProductFormComponent from './assets/js/components/add_product.js';
        import ToastComponent from './assets/js/components/ToastComponent.js';
        import TranslationComponent from './assets/js/components/TranslationComponent.js';
        
        // 仅初始化表单与通知（新增专用，不处理编辑模式）
        const eventBus = new EventBus();
        new ToastComponent('#toast-notification', eventBus);
        const productForm = new ProductFormComponent('#product-form-section', eventBus);
        const translationComponent = new TranslationComponent('#translation-component', eventBus);
        
        // 将翻译组件实例保存到元素上，供其他组件访问
        const translationElement = document.querySelector('#translation-component');
        if (translationElement) {
            translationElement._componentInstance = translationComponent;
        }
    </script>
</body>
</html>


