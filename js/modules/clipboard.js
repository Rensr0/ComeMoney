// 剪贴板管理模块
import { showAlert } from './ui.js';

// 复制文本到剪贴板
export function copyToClipboard(text) {
    if (!text) {
        showAlert('请先生成链接！', 'error');
        return false;
    }
    
    // 尝试使用现代剪贴板API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                return true;
            })
            .catch(err => {
                console.error('剪贴板API失败:', err);
                // 尝试备用方法
                return fallbackCopy(text);
            });
    } else {
        // 不支持clipboard API时使用备用方法
        return fallbackCopy(text);
    }
    
    return true;
}

// 备用复制方法
function fallbackCopy(text) {
    try {
        // 创建临时textarea元素
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // 设置样式使元素不可见
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        // 尝试执行复制命令
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            return true;
        } else {
            showAlert('复制失败，请手动复制链接。', 'error');
            return false;
        }
    } catch (err) {
        console.error('备用复制方法失败:', err);
        showAlert('复制失败，请长按链接并手动复制。', 'error');
        return false;
    }
} 