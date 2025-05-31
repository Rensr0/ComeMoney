// 定时器管理模块
import { calculateRates, calculateTodayEarnings, calculateWorkProgress, calculateMonthEarnings, calculateYearEarnings } from './calculator.js';
import { updateEarningsDisplay, updateClock, updateRatesDisplay, updateWorkTimeDisplay, updateExtendedEarnings, updateHolidayInfo } from './ui.js';
import { getNextHoliday } from './holiday.js';
import { getConfig } from './config.js';

// 启动定时器
export function startTimers() {
    // 初始化计算
    const { hourlyWage, minuteWage } = calculateRates();
    updateRatesDisplay(hourlyWage, minuteWage);
    
    // 立即更新收入和时钟
    updateEarnings();
    updateClock();
    
    // 立即更新月收入和年收入
    updateExtendedEarningsData();
    
    // 立即更新假期信息
    updateHolidayData();
    
    // 立即更新下班时间倒计时
    updateTimeToLeave();
    
    // 设置定时器
    setInterval(updateEarnings, 100); // 每100毫秒更新一次收入，使变化更平滑
    setInterval(updateClock, 1000);   // 每秒更新一次时钟
    setInterval(updateTimeToLeave, 1000); // 每秒更新一次下班时间倒计时
    setInterval(updateExtendedEarningsData, 60000); // 每分钟更新一次月收入和年收入
    setInterval(updateHolidayData, 3600000); // 每小时更新一次假期信息
}

// 更新收入显示
function updateEarnings() {
    // 重新计算费率，确保根据当前配置更新
    const { hourlyWage, minuteWage } = calculateRates();
    
    // 计算今日收入和工作进度
    const { earnings, hours, minutes } = calculateTodayEarnings();
    const progress = calculateWorkProgress();
    
    // 更新UI显示
    updateRatesDisplay(hourlyWage, minuteWage);
    updateEarningsDisplay(earnings, progress);
    updateWorkTimeDisplay(hours, minutes);
}

// 更新月收入和年收入数据
async function updateExtendedEarningsData() {
    try {
        // 计算月收入和年收入
        const monthEarnings = calculateMonthEarnings();
        const yearEarnings = calculateYearEarnings();
        
        // 更新UI显示
        updateExtendedEarnings(monthEarnings, yearEarnings);
    } catch (error) {
        console.error('更新扩展收入数据失败:', error);
    }
}

// 更新假期数据
async function updateHolidayData() {
    try {
        // 获取下一个假期信息
        const holidayInfo = await getNextHoliday();
        
        // 更新UI显示
        updateHolidayInfo(holidayInfo);
    } catch (error) {
        console.error('更新假期数据失败:', error);
    }
}

// 更新距离下班时间
function updateTimeToLeave() {
    const timeToLeaveElement = document.getElementById('timeToLeave');
    if (!timeToLeaveElement) return;
    
    const config = getConfig();
    const now = new Date();
    
    // 获取下班时间
    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    
    // 创建今天的下班时间
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // 如果已经过了下班时间
    if (now >= endTime) {
        timeToLeaveElement.textContent = "已下班";
        return;
    }
    
    // 计算剩余时间（毫秒）
    const remainingTime = endTime - now;
    
    // 转换为小时、分钟和秒
    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
    
    // 格式化显示
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    timeToLeaveElement.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}