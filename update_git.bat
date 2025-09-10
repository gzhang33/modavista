@echo off
echo Initializing git repository...

REM Initialize git repository
git init

REM Configure git user
git config user.name "Admin"
git config user.email "admin@example.com"

REM Add remote repository (replace with actual repository URL)
git remote add origin https://github.com/your-username/showcase.git

REM Add all files
git add .

REM Commit changes
git commit -m "feat: 实现Admin管理界面意大利语化和增强会话管理

- 将dashboard.php表头翻译为意大利语
- 修改JavaScript组件使用意大利语API调用  
- 实现长期登录支持(30天会话生命周期)
- 添加智能会话管理和过期检测
- 创建会话过期自动提示机制
- 优化API客户端集成会话管理
- 删除color表中的null记录
- 完善多语言国际化支持"

REM Push to remote repository
git branch -M main
git push -u origin main

echo Git repository updated successfully!
pause
