// 主入口文件
import { initUI } from './modules/ui.js';
import { initConfig } from './modules/config.js';
import { setupEventListeners } from './modules/events.js';
import { startTimers } from './modules/timers.js';
import { showSettingsPage, showStatsPage, showAboutPage } from './modules/ui.js';

// 初始化应用
async function init() {
    // 初始化配置，获取配置状态
    const configStatus = initConfig();
    
    // 初始化UI，传递配置状态
    initUI(configStatus);
    
    // 设置事件监听器
    setupEventListeners();
    
    // 启动定时器
    startTimers();
}

// 当DOM加载完成后初始化应用
window.addEventListener('DOMContentLoaded', init); 