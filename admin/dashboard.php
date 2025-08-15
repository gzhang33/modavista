<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>展示管理后台</title>
    <link rel="stylesheet" href="assets/css/admin_style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body>
    <script>
        // 进入后台前做一次服务端会话校验
        fetch('../api/check_session.php')
            .then(r => r.json())
            .then(data => {
                if (!data.loggedIn) {
                    window.location.href = 'login.html';
                }
            })
            .catch(() => {
                window.location.href = 'login.html';
            });
    </script>
    <div class="dashboard-container">
        <main class="main-content">
            <?php include 'components/products_management.php'; ?>
        </main>
    </div>
    
    <?php include 'components/modals.php'; ?>

    <script type="module" src="assets/js/main.js"></script>
</body>
</html>
