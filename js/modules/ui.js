// UI管理模块
import { getConfig } from './config.js';
import { formatDate } from './holiday.js';

// 页面元素引用
const todayEarned = document.querySelector('.today-earned');
const hourlyRate = document.getElementById('hourlyRate');
const minuteRate = document.getElementById('minuteRate');
const progressBar = document.querySelector('.progress-bar');
const workProgress = document.getElementById('workProgress');
const timeWorked = document.getElementById('timeWorked');
const currentTimeElement = document.getElementById('currentTime');
const motivationText = document.getElementById('motivationText');
const headerDesc = document.getElementById('headerDesc');

// 新增的扩展统计元素
const monthEarnedElement = document.getElementById('monthEarned');
const yearEarnedElement = document.getElementById('yearEarned');

// 假期信息元素
const holidayNameElement = document.getElementById('holidayName');
const holidayDaysElement = document.getElementById('holidayDays');
const holidayDateElement = document.getElementById('holidayDate');

// 页面导航元素
const settingsPage = document.getElementById('settingsPage');
const statsPage = document.getElementById('statsPage');
const aboutPage = document.getElementById('aboutPage');
const settingsBtn = document.getElementById('settingsBtn');
const statsBtn = document.getElementById('statsBtn');
const aboutBtn = document.getElementById('aboutBtn');

// 菜单元素
const menuButton = document.getElementById('menuButton');
const menuClose = document.getElementById('menuClose');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

// 分享链接元素
const shareContainer = document.getElementById('shareContainer');
const shareLink = document.getElementById('shareLink');

// 自定义弹窗元素
const customAlert = document.getElementById('customAlert');
const alertMessage = document.getElementById('alertMessage');
const alertTitle = document.querySelector('.alert-title');
const alertIcon = document.querySelector('.alert-icon i');

// 页面描述文案
const pageDescriptions = {
    settings: "设定您的工作参数，开始计算您的收入！",
    stats: "来，来，来财！",
    about: "了解应用的更新历史和未来计划"
};

// 初始化UI
export function initUI(configStatus) {
    // 如果是从URL导入配置成功
    if (configStatus && configStatus.fromUrl && configStatus.urlImportSuccess) {
        // 显示统计页面
        showStatsPage();
        // 显示导入成功提示
        showAlert('配置导入成功！', 'success');
        // 设置访问标记
        localStorage.setItem('hasVisitedBefore', 'true');
        return;
    }
    
    // 如果是从URL导入配置但失败了
    if (configStatus && configStatus.fromUrl && !configStatus.urlImportSuccess) {
        // 显示设置页面
        showSettingsPage();
        // 显示导入失败提示
        showAlert('抱歉，参数导入失败，请手动配置一下吧', 'error');
        // 设置访问标记
        localStorage.setItem('hasVisitedBefore', 'true');
        return;
    }
    
    // 检查是否是首次访问
    const isFirstVisit = !localStorage.getItem('hasVisitedBefore');
    
    if (isFirstVisit) {
        // 首次访问，显示设置页面
        showSettingsPage();
        // 设置访问标记
        localStorage.setItem('hasVisitedBefore', 'true');
    } else {
        // 非首次访问，显示统计页面
        updateHeaderDescription('stats');
    }
}

// 显示设置页面
export function showSettingsPage(e) {
    if (e) e.preventDefault();
    
    // 清除URL参数，恢复干净的URL
    if (window.history && window.history.replaceState) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    
    settingsPage.classList.add('active');
    statsPage.classList.remove('active');
    aboutPage.classList.remove('active');
    
    settingsBtn.classList.add('active');
    statsBtn.classList.remove('active');
    aboutBtn.classList.remove('active');
    
    updateHeaderDescription('settings');
    
    // 关闭菜单
    closeMenu();
}

// 显示统计页面
export function showStatsPage(e) {
    if (e) e.preventDefault();
    
    statsPage.classList.add('active');
    settingsPage.classList.remove('active');
    aboutPage.classList.remove('active');
    
    statsBtn.classList.add('active');
    settingsBtn.classList.remove('active');
    aboutBtn.classList.remove('active');
    
    updateHeaderDescription('stats');
    
    // 关闭菜单
    closeMenu();
}

// 显示关于页面
export function showAboutPage(e) {
    if (e) e.preventDefault();
    
    aboutPage.classList.add('active');
    statsPage.classList.remove('active');
    settingsPage.classList.remove('active');
    
    aboutBtn.classList.add('active');
    statsBtn.classList.remove('active');
    settingsBtn.classList.remove('active');
    
    updateHeaderDescription('about');
    
    // 关闭菜单
    closeMenu();
}

// 打开菜单
export function openMenu() {
    sideMenu.classList.add('active');
    overlay.classList.add('active');
    
    // 添加滚动锁定
    document.body.style.overflow = 'hidden';
}

// 关闭菜单
export function closeMenu() {
    sideMenu.classList.remove('active');
    overlay.classList.remove('active');
    
    // 移除滚动锁定
    document.body.style.overflow = '';
}

// 更新头部描述文案
function updateHeaderDescription(page) {
    headerDesc.textContent = pageDescriptions[page];
    
    // 添加简单的淡入动画
    headerDesc.style.opacity = '0';
    setTimeout(() => {
        headerDesc.style.transition = 'opacity 0.5s ease';
        headerDesc.style.opacity = '1';
    }, 50);
}

// 显示自定义弹窗
export function showAlert(message, type = 'success') {
    alertMessage.textContent = message;
    
    // 根据类型设置标题和图标
    if (type === 'error') {
        alertTitle.textContent = '错误';
        alertIcon.className = 'fas fa-exclamation-circle';
        alertIcon.style.color = '#e74c3c';
    } else {
        alertTitle.textContent = '成功';
        alertIcon.className = 'fas fa-check-circle';
        alertIcon.style.color = '#ff7e5f';
    }
    
    // 显示弹窗
    customAlert.classList.add('show');
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleEscKey);
}

// 隐藏自定义弹窗
export function hideAlert() {
    customAlert.classList.remove('show');
    document.removeEventListener('keydown', handleEscKey);
}

// 处理ESC键关闭弹窗
function handleEscKey(e) {
    if (e.key === 'Escape') {
        hideAlert();
        closeMenu();
    }
}

// 显示分享链接
export function displayShareLink(linkText) {
    if (!linkText) return;
    
    // 显示链接
    shareLink.textContent = linkText;
    shareContainer.style.display = 'block';
    
    // 添加淡入动画效果
    shareContainer.style.opacity = '0';
    setTimeout(() => {
        shareContainer.style.transition = 'opacity 0.5s ease';
        shareContainer.style.opacity = '1';
        // 平滑滚动到分享区域
        shareContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
    
    // 添加鼠标悬停效果
    shareLink.style.cursor = 'pointer';
    shareLink.setAttribute('title', '点击复制链接');
}

// 显示复制成功的反馈
export function showCopySuccess() {
    // 添加复制成功的视觉反馈
    shareLink.style.backgroundColor = '#f0fff0';
    shareLink.style.borderColor = '#2ecc71';
    setTimeout(() => {
        shareLink.style.backgroundColor = '';
        shareLink.style.borderColor = '';
    }, 1000);
    
    // 更改复制按钮文本，短暂显示已复制
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const originalText = copyLinkBtn.innerHTML;
    copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
    copyLinkBtn.style.background = 'linear-gradient(to right, #2ecc71, #27ae60)';
    
    setTimeout(() => {
        copyLinkBtn.innerHTML = originalText;
        copyLinkBtn.style.background = '';
    }, 2000);
    
    showAlert('链接已复制到剪贴板！');
}

// 更新收入显示
export function updateEarningsDisplay(todayEarningsValue, progressValue) {
    const config = getConfig();
    // 获取小数位数设置
    const decimalPlaces = config.decimalPlaces || 2;
    
    // 更新显示
    todayEarned.textContent = `¥ ${todayEarningsValue.toFixed(decimalPlaces)}`;
    progressBar.style.width = `${progressValue}%`;
    workProgress.textContent = `${progressValue}%`;
    
    // 更新激励语
    const dailySalary = config.monthlySalary / config.workDays;
    updateMotivation(todayEarningsValue, dailySalary);
}

// 更新月收入和年收入显示
export function updateExtendedEarnings(monthEarnings, yearEarnings) {
    const config = getConfig();
    const decimalPlaces = config.decimalPlaces || 2;
    
    // 更新月收入和年收入显示
    monthEarnedElement.textContent = `¥ ${monthEarnings.toFixed(decimalPlaces)}`;
    yearEarnedElement.textContent = `¥ ${yearEarnings.toFixed(decimalPlaces)}`;
}

// 更新假期信息
export function updateHolidayInfo(holidayInfo) {
    if (!holidayInfo) return;
    
    const { name, date, daysLeft } = holidayInfo;
    
    // 获取假期卡片元素
    const holidayCountdown = holidayDaysElement.closest('.stat-card');
    
    // 更新假期名称
    holidayNameElement.textContent = name || '下个假期';
    
    // 更新假期信息
    if (daysLeft === 0) {
        // 今天是假期
        holidayDaysElement.textContent = '祝您节日快乐！';
        holidayDaysElement.style.color = '#ff7e5f'; // 使用高亮颜色
        
        // 添加特殊样式类
        if (holidayCountdown) {
            holidayCountdown.classList.add('holiday-today');
            
            // 修改标题文案
            const holidayTitle = holidayCountdown.querySelector('.stat-label');
            if (holidayTitle) {
                holidayTitle.innerHTML = `今天就是<span id="holidayName">${name}，</span>`;
            }
            
            // 修改图标颜色
            const holidayIcon = holidayCountdown.querySelector('.stat-icon i');
            if (holidayIcon) {
                holidayIcon.style.color = '#ff7e5f';
            }
        }
    } else {
        // 不是今天
        holidayDaysElement.textContent = `${daysLeft}天`;
        holidayDaysElement.style.color = ''; // 恢复默认颜色
        
        // 移除特殊样式类
        if (holidayCountdown) {
            holidayCountdown.classList.remove('holiday-today');
            
            // 恢复默认标题文案
            const holidayTitle = holidayCountdown.querySelector('.stat-label');
            if (holidayTitle) {
                holidayTitle.innerHTML = `距离 <span id="holidayName">${name}</span> 还有：`;
            }
            
            // 恢复图标默认颜色
            const holidayIcon = holidayCountdown.querySelector('.stat-icon i');
            if (holidayIcon) {
                holidayIcon.style.color = '';
            }
        }
    }
    
    // 更新假期日期
    holidayDateElement.textContent = formatDate(date);
}

// 更新费率显示
export function updateRatesDisplay(hourlyWage, minuteWage) {
    const config = getConfig();
    // 获取小数位数设置
    const decimalPlaces = config.decimalPlaces || 2;
    
    // 更新费率显示
    hourlyRate.textContent = `¥ ${hourlyWage.toFixed(decimalPlaces)}`;
    minuteRate.textContent = `¥ ${minuteWage.toFixed(Math.min(4, decimalPlaces + 2))}`;
}

// 更新工作时间显示
export function updateWorkTimeDisplay(hours, minutes) {
    timeWorked.textContent = `${hours}h ${minutes}m`;
}

// 更新时钟
export function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// 更新激励语
function updateMotivation(todayEarnings, dailySalary) {
    const percentage = (todayEarnings / dailySalary * 100).toFixed(1);
    
    if (percentage < 20) {
        motivationText.textContent = "新的一天开始了，您的收入正在增长！";
    } else if (percentage < 50) {
        motivationText.textContent = "坚持就是胜利，您已经完成了一部分目标！";
    } else if (percentage < 80) {
        motivationText.textContent = "超过一半了，继续努力，收入在不断增加！";
    } else if (percentage < 100) {
        motivationText.textContent = "快完成今天的目标了，再加把劲！";
    } else {
        motivationText.textContent = "恭喜您完成今日工作目标！";
    }
} 