// 事件处理模块
import { saveSettings, generateConfigShareLink } from './config.js';
import { showSettingsPage, showStatsPage, showAboutPage, showAlert, hideAlert, displayShareLink, showCopySuccess, openMenu, closeMenu } from './ui.js';
import { copyToClipboard } from './clipboard.js';
import { calculateRates } from './calculator.js';

// 设置事件监听器
export function setupEventListeners() {
    // 导航按钮事件
    document.getElementById('settingsBtn').addEventListener('click', showSettingsPage);
    document.getElementById('statsBtn').addEventListener('click', showStatsPage);
    document.getElementById('aboutBtn').addEventListener('click', showAboutPage);
    
    // 菜单按钮事件
    document.getElementById('menuButton').addEventListener('click', openMenu);
    document.getElementById('menuClose').addEventListener('click', closeMenu);
    document.getElementById('overlay').addEventListener('click', closeMenu);
    
    // 设置表单提交事件
    document.getElementById('workSettings').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 保存设置
        const success = saveSettings();
        
        if (success) {
            // 显示统计页面
            showStatsPage();
            // 显示保存成功提示
            showAlert('设置已保存！');
        } else {
            // 显示错误提示
            showAlert('保存失败，请检查您的输入！', 'error');
        }
    });
    
    // 生成分享链接按钮事件
    document.getElementById('generateLinkBtn').addEventListener('click', function() {
        // 生成分享链接
        const link = generateConfigShareLink();
        
        if (link) {
            // 显示分享链接
            displayShareLink(link);
        } else {
            // 显示错误提示
            showAlert('生成链接失败，请检查您的设置！', 'error');
        }
    });
    
    // 复制链接按钮事件
    document.getElementById('copyLinkBtn').addEventListener('click', function() {
        const link = document.getElementById('shareLink').textContent;
        copyToClipboard(link);
        showCopySuccess();
    });
    
    // 分享链接点击事件（也可以复制）
    document.getElementById('shareLink').addEventListener('click', function() {
        const link = this.textContent;
        copyToClipboard(link);
        showCopySuccess();
    });
    
    // 弹窗关闭按钮事件
    document.getElementById('alertButton').addEventListener('click', hideAlert);
    
    // 键盘事件
    document.addEventListener('keydown', function(e) {
        // ESC键关闭弹窗
        if (e.key === 'Escape') {
            hideAlert();
            closeMenu();
        }
    });
} 