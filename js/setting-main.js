// setting-main.js - 设置页面入口文件
import { initConfig } from './modules/config.js';
import { setupNavigationEvents } from './modules/navigation.js';
import { setupSettingEvents } from './modules/settings-events.js';
import { 
    markAsVisited, 
    shouldShowWelcomeMessage, 
    showFirstVisitMessage,
    showConfigImportFailMessage
} from './modules/ui.js';

// 初始化应用
function init() {
    // 检查是否是真正的首次访问（从其他页面重定向而来）
    const isRedirectedFirstVisit = shouldShowWelcomeMessage();
    
    // 标记用户已访问
    markAsVisited();
    
    // 加载配置
    initConfig();
    
    // 设置导航事件
    setupNavigationEvents();
    
    // 设置设置页面事件
    setupSettingEvents();
    
    // 显示首次访问弹窗
    if (isRedirectedFirstVisit) {
        showFirstVisitMessage();
    }
    
    // 检查是否从失败的导入重定向
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('import_failed') === 'true') {
        showConfigImportFailMessage();
        // 清除URL参数
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
}

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', init); 