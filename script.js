// DOM 元素
const form = document.getElementById('workSettings');
const todayEarned = document.querySelector('.today-earned');
const hourlyRate = document.getElementById('hourlyRate');
const minuteRate = document.getElementById('minuteRate');
const progressBar = document.querySelector('.progress-bar');
const workProgress = document.getElementById('workProgress');
const timeWorked = document.getElementById('timeWorked');
const currentTimeElement = document.getElementById('currentTime');
const motivationText = document.getElementById('motivationText');
const headerDesc = document.getElementById('headerDesc');

// 自定义弹窗元素
const customAlert = document.getElementById('customAlert');
const alertMessage = document.getElementById('alertMessage');
const alertButton = document.getElementById('alertButton');
const alertTitle = document.querySelector('.alert-title');
const alertIcon = document.querySelector('.alert-icon i');

// 页面导航元素
const settingsPage = document.getElementById('settingsPage');
const statsPage = document.getElementById('statsPage');
const settingsBtn = document.getElementById('settingsBtn');
const statsBtn = document.getElementById('statsBtn');

// 页面描述文案
const pageDescriptions = {
    settings: "设定您的工作参数，开始计算您的收入！",
    stats: "来，来，来财！"
};

// 工作时间配置
let config = {
    monthlySalary: 10000,
    workDays: 22,
    startTime: '09:00',
    endTime: '18:00',
    lunchBreak: 0,
    decimalPlaces: 2
};

// 存储上次计算的收入
let lastEarnings = 0;
let secondRate = 0;

// 初始化
function init() {
    // 从localStorage加载保存的设置
    const savedConfig = localStorage.getItem('workConfig');
    if (savedConfig) {
        config = JSON.parse(savedConfig);
        document.getElementById('monthlySalary').value = config.monthlySalary;
        document.getElementById('workDays').value = config.workDays;
        document.getElementById('startTime').value = config.startTime;
        document.getElementById('endTime').value = config.endTime;
        document.getElementById('lunchBreak').value = config.lunchBreak;
        
        // 设置小数位数
        if (config.decimalPlaces !== undefined) {
            document.getElementById('decimalPlaces').value = config.decimalPlaces;
        }
    }
    
    // 设置事件监听器
    form.addEventListener('submit', saveSettings);
    
    // 页面导航事件监听
    settingsBtn.addEventListener('click', showSettingsPage);
    statsBtn.addEventListener('click', showStatsPage);
    
    // 自定义弹窗事件监听
    alertButton.addEventListener('click', hideAlert);
    
    // 初始化计算
    calculateRates();
    
    // 立即开始更新收入和时钟
    updateEarnings();
    updateClock();
    
    // 每秒更新一次收入和时钟
    setInterval(updateEarnings, 100); // 每100毫秒更新一次收入，使变化更平滑
    setInterval(updateClock, 1000);
    
    // 设置初始页面描述
    updateHeaderDescription('settings');
}

// 显示设置页面
function showSettingsPage(e) {
    if (e) e.preventDefault();
    settingsPage.classList.add('active');
    statsPage.classList.remove('active');
    settingsBtn.classList.add('active');
    statsBtn.classList.remove('active');
    updateHeaderDescription('settings');
}

// 显示统计页面
function showStatsPage(e) {
    if (e) e.preventDefault();
    statsPage.classList.add('active');
    settingsPage.classList.remove('active');
    statsBtn.classList.add('active');
    settingsBtn.classList.remove('active');
    updateHeaderDescription('stats');
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
function showAlert(message, type = 'success') {
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
function hideAlert() {
    customAlert.classList.remove('show');
    document.removeEventListener('keydown', handleEscKey);
}

// 处理ESC键关闭弹窗
function handleEscKey(e) {
    if (e.key === 'Escape') {
        hideAlert();
    }
}

// 保存设置
function saveSettings(e) {
    e.preventDefault();
    
    // 更新配置
    config.monthlySalary = parseFloat(document.getElementById('monthlySalary').value) || 10000;
    config.workDays = parseInt(document.getElementById('workDays').value) || 22;
    config.startTime = document.getElementById('startTime').value;
    config.endTime = document.getElementById('endTime').value;
    config.lunchBreak = parseInt(document.getElementById('lunchBreak').value) || 0;
    config.decimalPlaces = parseInt(document.getElementById('decimalPlaces').value) || 2;
    
    // 验证工作时间和午休时间
    const totalWorkMinutes = calculateTotalWorkMinutes();
    if (totalWorkMinutes <= 0) {
        showAlert('总工作时间必须大于0！请调整上下班时间。', 'error');
        return;
    }
    
    // 保存到localStorage
    localStorage.setItem('workConfig', JSON.stringify(config));
    
    // 重新计算费率
    calculateRates();
    
    // 更新显示
    updateEarnings();
    
    // 显示成功消息
    showAlert('设置已保存！收入数据已更新。');
    
    // 自动切换到统计页面
    showStatsPage();
}

// 计算总工作分钟数（不包括午休）
function calculateTotalWorkMinutes() {
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    
    // 计算工作分钟数
    let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
    
    // 如果午休时间为0，直接返回总工作时间
    if (config.lunchBreak <= 0) {
        return totalMinutes;
    }
    
    // 午休时间不能超过总工作时间
    const lunchBreak = Math.min(totalMinutes, config.lunchBreak);
    
    // 减去午休时间
    totalMinutes -= lunchBreak;
    
    return totalMinutes;
}

// 计算每小时、每分钟和每秒的收入率
function calculateRates() {
    const dailySalary = config.monthlySalary / config.workDays;
    const workHours = calculateWorkHours();
    const hourlyWage = dailySalary / Math.max(0.1, workHours); // 防止除以零或负数
    const minuteWage = hourlyWage / 60;
    secondRate = minuteWage / 60; // 每秒收入
    
    // 获取小数位数设置
    const decimalPlaces = config.decimalPlaces || 2;
    
    // 更新费率显示
    hourlyRate.textContent = `¥ ${hourlyWage.toFixed(decimalPlaces)}`;
    minuteRate.textContent = `¥ ${minuteWage.toFixed(Math.min(4, decimalPlaces + 2))}`;
}

// 更新收入显示
function updateEarnings() {
    const now = new Date();
    const progress = calculateWorkProgress();
    const todayEarnings = calculateTodayEarnings();
    
    // 获取小数位数设置
    const decimalPlaces = config.decimalPlaces || 2;
    
    // 更新显示
    todayEarned.textContent = `¥ ${todayEarnings.toFixed(decimalPlaces)}`;
    progressBar.style.width = `${progress}%`;
    workProgress.textContent = `${progress}%`;
    
    // 更新激励语
    const dailySalary = config.monthlySalary / config.workDays;
    updateMotivation(todayEarnings, dailySalary);
}

// 计算每日工作小时数
function calculateWorkHours() {
    const totalMinutes = calculateTotalWorkMinutes();
    
    // 转换为小时，确保至少为0.1小时，避免除以零
    return Math.max(0.1, totalMinutes / 60);
}

// 计算今日收入
function calculateTodayEarnings() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // 获取工作开始时间
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    
    // 获取工作结束时间
    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    
    // 计算工作时间（秒）
    const workStartSeconds = (startHour * 60 + startMinute) * 60;
    const workEndSeconds = (endHour * 60 + endMinute) * 60;
    
    // 计算总工作时间（秒）
    const totalWorkSeconds = workEndSeconds - workStartSeconds;
    
    // 午休时间（秒），不能超过总工作时间
    const lunchBreakSeconds = Math.min(totalWorkSeconds, config.lunchBreak * 60);
    
    const currentSeconds = (currentHour * 60 + currentMinute) * 60 + currentSecond;
    
    // 计算已工作秒数（考虑午休）
    let workedSeconds = 0;
    
    // 如果还没开始工作
    if (currentSeconds < workStartSeconds) {
        workedSeconds = 0;
    } 
    // 如果已经下班
    else if (currentSeconds > workEndSeconds) {
        workedSeconds = Math.max(0, workEndSeconds - workStartSeconds - lunchBreakSeconds);
    }
    // 如果在工作时间内
    else {
        workedSeconds = currentSeconds - workStartSeconds;
        
        // 减去午休时间（如果处于午休之后）
        // 午休开始时间设为工作时间的中点
        const lunchStartSeconds = workStartSeconds + Math.floor((totalWorkSeconds - lunchBreakSeconds) / 2);
        
        if (currentSeconds > lunchStartSeconds) {
            // 如果当前时间超过午休开始时间，减去已经过去的午休时间
            const lunchElapsed = Math.min(lunchBreakSeconds, currentSeconds - lunchStartSeconds);
            workedSeconds = Math.max(0, workedSeconds - lunchElapsed);
        }
    }
    
    // 更新工作时间显示
    const hours = Math.floor(workedSeconds / 3600);
    const minutes = Math.floor((workedSeconds % 3600) / 60);
    timeWorked.textContent = `${hours}h ${minutes}m`;
    
    // 计算收入 (秒级精度)，确保为正数
    return Math.max(0, workedSeconds * secondRate);
}

// 计算工作进度
function calculateWorkProgress() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // 获取工作开始时间
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    
    // 获取工作结束时间
    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    
    // 计算工作时间（秒）
    const workStartSeconds = (startHour * 60 + startMinute) * 60;
    const workEndSeconds = (endHour * 60 + endMinute) * 60;
    
    // 计算总工作时间（秒）
    const totalWorkSeconds = workEndSeconds - workStartSeconds;
    
    // 午休时间（秒），不能超过总工作时间
    const lunchBreakSeconds = Math.min(totalWorkSeconds, config.lunchBreak * 60);
    
    // 实际工作时间（秒）
    const totalWorkSecondsNet = Math.max(1, totalWorkSeconds - lunchBreakSeconds);
    
    // 当前时间（秒）
    const currentSeconds = (currentHour * 60 + currentMinute) * 60 + currentSecond;
    
    // 计算进度百分比
    let progress = 0;
    
    // 如果还没开始工作
    if (currentSeconds < workStartSeconds) {
        progress = 0;
    } 
    // 如果已经下班
    else if (currentSeconds > workEndSeconds) {
        progress = 100;
    }
    // 如果在工作时间内
    else {
        // 午休开始时间设为工作时间的中点
        const lunchStartSeconds = workStartSeconds + Math.floor((totalWorkSeconds - lunchBreakSeconds) / 2);
        
        if (currentSeconds < lunchStartSeconds) {
            // 午休前
            progress = ((currentSeconds - workStartSeconds) / totalWorkSecondsNet) * 100;
        } else if (currentSeconds < lunchStartSeconds + lunchBreakSeconds) {
            // 午休中
            progress = ((lunchStartSeconds - workStartSeconds) / totalWorkSecondsNet) * 100;
        } else {
            // 午休后
            const afterLunchSeconds = currentSeconds - (lunchStartSeconds + lunchBreakSeconds);
            progress = ((lunchStartSeconds - workStartSeconds + afterLunchSeconds) / totalWorkSecondsNet) * 100;
        }
        
        progress = Math.min(100, Math.max(0, progress));
    }
    
    return Math.round(progress);
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

// 更新时钟
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTimeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// 初始化应用
window.addEventListener('DOMContentLoaded', init); 