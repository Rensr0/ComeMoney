// 定时器管理模块
import { calculateRates, calculateTodayEarnings, calculateWorkProgress, calculateMonthEarnings, calculateYearEarnings } from './calculator.js';
import { updateEarningsDisplay, updateClock, updateRatesDisplay, updateWorkTimeDisplay, updateExtendedEarnings, updateHolidayInfo, updateWorkStatusText } from './ui.js';
import { getNextHoliday } from './holiday.js';
import { getConfig } from './config.js';

// 工作状态跟踪
let isWorkOver = false;

// 定时器ID存储
let earningsTimerId = null;
let timeToLeaveTimerId = null;
let extendedEarningsTimerId = null;

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
    earningsTimerId = setInterval(updateEarnings, 100); // 每100毫秒更新一次收入，使变化更平滑
    setInterval(updateClock, 100);   // 每100毫秒更新一次时钟
    timeToLeaveTimerId = setInterval(updateTimeToLeave, 100); // 每100毫秒更新一次下班时间倒计时
    extendedEarningsTimerId = setInterval(updateExtendedEarningsData, 100); // 每100毫秒更新一次月收入和年收入
    setInterval(updateHolidayData, 3600000); // 每小时更新一次假期信息
}

// 停止与收入相关的定时器
function stopEarningsTimers() {
    if (earningsTimerId) {
        clearInterval(earningsTimerId);
        earningsTimerId = null;
    }
    
    if (extendedEarningsTimerId) {
        clearInterval(extendedEarningsTimerId);
        extendedEarningsTimerId = null;
    }
    
    if (timeToLeaveTimerId) {
        clearInterval(timeToLeaveTimerId);
        timeToLeaveTimerId = null;
    }
}

// 更新收入显示
function updateEarnings() {
    // 如果已下班，不再更新收入数据
    if (isWorkOver) return;
    
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
    // 如果已下班，不再更新月收入和年收入数据
    if (isWorkOver) return;
    
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
    
    // 获取上下班时间
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    
    // 创建今天的上班和下班时间
    const startTime = new Date();
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // 检查是否是夜班模式
    const isNightShift = (startHour > endHour) || (startHour === endHour && startMinute > endMinute);
    
    // 如果是夜班，且当前时间在零点后但早于下班时间，需要将下班时间推到第二天
    if (isNightShift && now < endTime) {
        // 将结束时间设置为第二天
        endTime.setDate(endTime.getDate() + 1);
    }
    
    // 如果是夜班，且当前时间晚于上班时间但晚于23:59，需要将当前时间视为第二天
    let adjustedNow = new Date(now);
    if (isNightShift && now < startTime && now < endTime) {
        // 对于夜班，如果当前时间在第二天的凌晨但还没下班，调整时间比较
        adjustedNow.setDate(adjustedNow.getDate() + 1);
    }
    
    // 获取下班时间卡片元素
    const timeToLeaveCard = timeToLeaveElement.closest('.stat-card');
    
    // 如果还没到上班时间
    if (now < startTime) {
        // 修改标题文案
        const timeToLeaveTitle = timeToLeaveCard.querySelector('.stat-label');
        if (timeToLeaveTitle) {
            timeToLeaveTitle.textContent = "距离上班还有";
        }
        
        // 计算剩余时间（毫秒）
        const remainingTime = startTime - now;
        
        // 转换为小时、分钟和秒
        const hours = Math.floor(remainingTime / (1000 * 60 * 60));
        const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
        
        // 格式化显示
        const formattedHours = String(hours).padStart(2, '0');
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        
        timeToLeaveElement.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
        
        // 更新工作状态文案
        updateWorkStatusText();
        return;
    }
    
    // 如果已经过了下班时间
    if (adjustedNow >= endTime) {
        // 如果还没有设置为已下班状态
        if (!isWorkOver) {
            // 设置已下班标志
            isWorkOver = true;
            
            // 更新显示文本
            timeToLeaveElement.textContent = "已下班";
            
            // 添加特殊样式类，类似假期样式
            if (timeToLeaveCard) {
                timeToLeaveCard.classList.add('holiday-today');
                
                // 修改标题文案
                const timeToLeaveTitle = timeToLeaveCard.querySelector('.stat-label');
                if (timeToLeaveTitle) {
                    timeToLeaveTitle.textContent = "今天工作已完成！";
                }
                
                // 修改图标颜色
                const timeToLeaveIcon = timeToLeaveCard.querySelector('.stat-icon i');
                if (timeToLeaveIcon) {
                    timeToLeaveIcon.style.color = '#ff7e5f';
                }
            }
            
            // 更新工作状态文案
            updateWorkStatusText();
            
            // 停止相关定时器
            stopEarningsTimers();
        }
        
        return;
    } else {
        // 上班时间已到，下班时间未到，显示距离下班还有多久
        // 未下班，重置标志
        isWorkOver = false;
        
        // 移除特殊样式类
        if (timeToLeaveCard) {
            timeToLeaveCard.classList.remove('holiday-today');
            
            // 恢复默认标题文案
            const timeToLeaveTitle = timeToLeaveCard.querySelector('.stat-label');
            if (timeToLeaveTitle) {
                timeToLeaveTitle.textContent = "距离下班还有";
            }
            
            // 恢复图标默认颜色
            const timeToLeaveIcon = timeToLeaveCard.querySelector('.stat-icon i');
            if (timeToLeaveIcon) {
                timeToLeaveIcon.style.color = '';
            }
        }
        
        // 更新工作状态文案
        updateWorkStatusText();
    }
    
    // 计算距离下班的剩余时间（毫秒）
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