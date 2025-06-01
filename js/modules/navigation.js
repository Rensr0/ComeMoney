// 导航模块 - 处理多页面间的导航

// 设置导航事件
export function setupNavigationEvents() {
    // 导航按钮事件
    const statsBtn = document.getElementById('statsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    
    if (statsBtn) {
        statsBtn.addEventListener('click', navigateToStats);
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', navigateToSettings);
    }
    
    if (aboutBtn) {
        aboutBtn.addEventListener('click', navigateToAbout);
    }
    
    // 菜单按钮事件
    const menuButton = document.getElementById('menuButton');
    const menuClose = document.getElementById('menuClose');
    const overlay = document.getElementById('overlay');
    
    if (menuButton) {
        menuButton.addEventListener('click', openMenu);
    }
    
    if (menuClose) {
        menuClose.addEventListener('click', closeMenu);
    }
    
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    // 设置当前活动导航按钮
    setActiveNavButton();
    
    // 为弹窗关闭按钮添加事件
    const alertButton = document.getElementById('alertButton');
    if (alertButton) {
        alertButton.addEventListener('click', hideAlert);
    }
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleEscKey);
}

// 导航到统计页面
export function navigateToStats(e) {
    if (e) e.preventDefault();
    closeMenu();
    window.location.href = 'index.html';
}

// 导航到设置页面
export function navigateToSettings(e) {
    if (e) e.preventDefault();
    closeMenu();
    window.location.href = 'setting.html';
}

// 导航到关于页面
export function navigateToAbout(e) {
    if (e) e.preventDefault();
    closeMenu();
    window.location.href = 'about.html';
}

// 打开菜单
function openMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    
    if (sideMenu && overlay) {
        sideMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// 关闭菜单
export function closeMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const overlay = document.getElementById('overlay');
    
    if (sideMenu && overlay) {
        sideMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// 隐藏自定义弹窗
function hideAlert() {
    const customAlert = document.getElementById('customAlert');
    if (customAlert) {
        customAlert.classList.remove('show');
    }
}

// 处理ESC键关闭弹窗
function handleEscKey(e) {
    if (e.key === 'Escape') {
        // 关闭弹窗
        hideAlert();
        // 关闭菜单
        closeMenu();
    }
}

// 设置当前活动导航按钮
function setActiveNavButton() {
    const statsBtn = document.getElementById('statsBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    
    // 根据当前页面URL设置活动按钮
    const currentPath = window.location.pathname;
    
    if (statsBtn && settingsBtn && aboutBtn) {
        // 移除所有活动状态
        statsBtn.classList.remove('active');
        settingsBtn.classList.remove('active');
        aboutBtn.classList.remove('active');
        
        // 根据当前路径设置活动状态
        if (currentPath.includes('index.html') || currentPath.endsWith('/') || currentPath === '') {
            statsBtn.classList.add('active');
            updateHeaderDescription('stats');
        } else if (currentPath.includes('setting.html')) {
            settingsBtn.classList.add('active');
            updateHeaderDescription('settings');
        } else if (currentPath.includes('about.html')) {
            aboutBtn.classList.add('active');
            updateHeaderDescription('about');
        }
    }
}

// 更新头部描述文案
function updateHeaderDescription(page) {
    const headerDesc = document.getElementById('headerDesc');
    if (!headerDesc) return;
    
    const pageDescriptions = {
        settings: "设定您的工作参数，开始计算您的收入！",
        stats: "来，来，来财！",
        about: "了解应用的更新历史和未来计划"
    };
    
    headerDesc.textContent = pageDescriptions[page];
    
    // 添加简单的淡入动画
    headerDesc.style.opacity = '0';
    setTimeout(() => {
        headerDesc.style.transition = 'opacity 0.5s ease';
        headerDesc.style.opacity = '1';
    }, 50);
}

// 应用页面过渡效果（移除，不再使用）
function applyPageTransition(url) {
    window.location.href = url;
} 