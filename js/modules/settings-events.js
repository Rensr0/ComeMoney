// 设置页面事件处理模块
import { saveSettings, generateConfigShareLink } from './config.js';
import { showAlert, displayShareLink, showCopySuccess, showConfigSaveSuccessMessage, showConfigSaveFailMessage } from './ui.js';
import { copyToClipboard } from './clipboard.js';
import { navigateToStats } from './navigation.js';

// 设置设置页面事件
export function setupSettingEvents() {
    // 设置表单提交事件
    const workSettings = document.getElementById('workSettings');
    if (workSettings) {
        workSettings.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 保存设置
            const success = saveSettings();
            
            if (success) {
                // 显示保存成功提示
                showConfigSaveSuccessMessage();
                
                // 延迟跳转到统计页面，让用户先看到成功提示
                setTimeout(() => {
                    navigateToStats();
                }, 800);
            } else {
                // 显示错误提示
                showConfigSaveFailMessage();
            }
        });
    }
    
    // 生成分享链接按钮事件
    const generateLinkBtn = document.getElementById('generateLinkBtn');
    if (generateLinkBtn) {
        generateLinkBtn.addEventListener('click', function() {
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
    }
    
    // 复制链接按钮事件
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', function() {
            const shareLink = document.getElementById('shareLink');
            if (shareLink) {
                const link = shareLink.textContent;
                copyToClipboard(link);
                showCopySuccess();
            }
        });
    }
    
    // 分享链接点击事件（也可以复制）
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        shareLink.addEventListener('click', function() {
            const link = this.textContent;
            copyToClipboard(link);
            showCopySuccess();
        });
    }
} 