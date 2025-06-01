// index-main.js - 统计页面入口文件
import { initConfig } from './modules/config.js';
import { setupNavigationEvents } from './modules/navigation.js';
import { startTimers } from './modules/timers.js';
import { isFirstVisit, markAsVisited, showConfigImportSuccessMessage } from './modules/ui.js';

// 检查是否是首次访问
if (isFirstVisit()) {
    // 首次访问，重定向到设置页面
    window.location.href = 'setting.html';
} else {
    // 当DOM加载完成后初始化应用
    document.addEventListener('DOMContentLoaded', function() {
        // 初始化应用
        init();
    });
}

// 初始化应用
async function init() {
    try {
        // 初始化配置
        const configStatus = initConfig();
        
        // 设置页面导航事件
        setupNavigationEvents();
        
        // 处理URL参数导入配置的情况
        if (configStatus && configStatus.fromUrl) {
            if (configStatus.urlImportSuccess) {
                // 显示导入成功提示
                showConfigImportSuccessMessage();
            } else {
                // 导入失败，重定向到设置页面
                console.log("配置导入失败，重定向到设置页面");
                window.location.href = 'setting.html?import_failed=true';
                return;
            }
        }
        
        // 启动定时器
        startTimers();
        
        // 设置访问标记
        markAsVisited();
    } catch (error) {
        console.error("初始化过程中出错:", error);
    }
} 