// about-main.js - 关于页面入口文件
import { setupNavigationEvents } from './modules/navigation.js';
import { isFirstVisit } from './modules/ui.js';

// 检查是否是首次访问
if (isFirstVisit()) {
    // 首次访问，重定向到设置页面
    window.location.href = 'setting.html';
} else {
    // 初始化应用
    document.addEventListener('DOMContentLoaded', function() {
        // 设置导航事件
        setupNavigationEvents();
    });
} 