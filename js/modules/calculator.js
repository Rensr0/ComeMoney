// 计算器模块
import { getConfig, calculateWorkHours, calculateTotalWorkMinutes } from './config.js';

// 存储上次计算的收入和每秒收入率
let lastEarnings = 0;
let secondRate = 0;

// 计算每小时、每分钟和每秒的收入率
export function calculateRates() {
    const config = getConfig();
    const dailySalary = config.monthlySalary / config.workDays;
    
    // 获取当前时间
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // 获取工作开始和结束时间
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    
    // 计算工作时间（秒）
    const workStartSeconds = (startHour * 60 + startMinute) * 60;
    const workEndSeconds = (endHour * 60 + endMinute) * 60;
    const currentSeconds = (currentHour * 60 + currentMinute) * 60 + currentSecond;
    
    // 计算总工作秒数（不包括午休）
    const totalWorkMinutes = calculateTotalWorkMinutes();
    const totalWorkSeconds = totalWorkMinutes * 60;
    
    // 计算实际工作小时数
    const workHours = calculateWorkHours();
    
    // 基础小时工资率
    const baseHourlyWage = dailySalary / Math.max(0.1, workHours);
    const baseMinuteWage = baseHourlyWage / 60;
    
    // 根据当前时间调整费率
    let adjustedHourlyWage = baseHourlyWage;
    let adjustedMinuteWage = baseMinuteWage;
    
    // 如果在工作时间内，根据剩余工作时间调整费率
    if (currentSeconds >= workStartSeconds && currentSeconds <= workEndSeconds) {
        // 计算剩余工作时间（秒）
        const remainingWorkSeconds = workEndSeconds - currentSeconds;
        
        // 计算已经过去的工作时间（秒）
        const elapsedWorkSeconds = currentSeconds - workStartSeconds;
        
        // 计算午休时间（秒）
        const lunchBreakSeconds = config.lunchBreak * 60;
        
        // 午休开始时间设为工作时间的中点
        const totalScheduledSeconds = workEndSeconds - workStartSeconds;
        const lunchStartSeconds = workStartSeconds + Math.floor((totalScheduledSeconds - lunchBreakSeconds) / 2);
        
        // 调整已经过去的工作时间，考虑午休
        let adjustedElapsedSeconds = elapsedWorkSeconds;
        if (currentSeconds > lunchStartSeconds) {
            const lunchElapsed = Math.min(lunchBreakSeconds, currentSeconds - lunchStartSeconds);
            adjustedElapsedSeconds = Math.max(0, elapsedWorkSeconds - lunchElapsed);
        }
        
        // 计算实际剩余工作时间（考虑午休）
        let adjustedRemainingSeconds = remainingWorkSeconds;
        if (currentSeconds < lunchStartSeconds) {
            // 如果午休还没开始，从剩余时间中减去午休
            adjustedRemainingSeconds = Math.max(0, remainingWorkSeconds - lunchBreakSeconds);
        } else if (currentSeconds < lunchStartSeconds + lunchBreakSeconds) {
            // 如果正在午休，调整剩余时间
            const remainingLunch = lunchStartSeconds + lunchBreakSeconds - currentSeconds;
            adjustedRemainingSeconds = Math.max(0, remainingWorkSeconds - remainingLunch);
        }
        
        // 计算总的有效工作时间（秒）
        const effectiveWorkSeconds = adjustedElapsedSeconds + adjustedRemainingSeconds;
        
        // 如果还有剩余工作时间，根据剩余工作时间调整费率
        if (effectiveWorkSeconds > 0) {
            // 计算剩余工资
            const remainingSalary = dailySalary - (dailySalary * (adjustedElapsedSeconds / totalWorkSeconds));
            
            // 根据剩余工作时间和剩余工资计算调整后的费率
            const remainingHours = adjustedRemainingSeconds / 3600;
            adjustedHourlyWage = remainingSalary / Math.max(0.1, remainingHours);
            adjustedMinuteWage = adjustedHourlyWage / 60;
        }
    }
    
    // 更新每秒收入率
    secondRate = adjustedMinuteWage / 60;
    
    return { 
        hourlyWage: adjustedHourlyWage, 
        minuteWage: adjustedMinuteWage, 
        secondRate 
    };
}

// 计算今日收入
export function calculateTodayEarnings() {
    const config = getConfig();
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
    
    // 计算工作时间（小时和分钟）
    const hours = Math.floor(workedSeconds / 3600);
    const minutes = Math.floor((workedSeconds % 3600) / 60);
    
    // 计算收入 (秒级精度)，确保为正数
    const earnings = Math.max(0, workedSeconds * secondRate);
    
    return { earnings, hours, minutes, workedSeconds };
}

// 计算工作进度
export function calculateWorkProgress() {
    const config = getConfig();
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

// 计算本月已赚收入
export function calculateMonthEarnings() {
    const config = getConfig();
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    
    // 计算本月工作日（假设每周一到周五为工作日）
    const workDaysInMonth = calculateWorkDaysInMonth(now.getFullYear(), now.getMonth());
    
    // 计算本月已过工作日
    const workDaysPassed = calculateWorkDaysPassed(now.getFullYear(), now.getMonth(), currentDay);
    
    // 计算月薪
    const monthlySalary = config.monthlySalary;
    
    // 计算每个工作日的收入
    const dailySalary = monthlySalary / workDaysInMonth;
    
    // 计算本月已赚收入（已过工作日 * 每日收入）
    const monthEarnings = dailySalary * workDaysPassed;
    
    return monthEarnings;
}

// 计算今年已赚收入
export function calculateYearEarnings() {
    const config = getConfig();
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    const currentDay = now.getDate();
    
    let totalEarnings = 0;
    
    // 计算已过完整月份的收入
    for (let month = 0; month < currentMonth; month++) {
        const workDaysInMonth = calculateWorkDaysInMonth(now.getFullYear(), month);
        totalEarnings += config.monthlySalary * (workDaysInMonth / config.workDays);
    }
    
    // 添加当月已赚收入
    totalEarnings += calculateMonthEarnings();
    
    return totalEarnings;
}

// 计算指定月份的工作日数（周一至周五）
function calculateWorkDaysInMonth(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let workDays = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay(); // 0是周日，1-5是周一到周五，6是周六
        
        // 如果是周一至周五，计为工作日
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            workDays++;
        }
    }
    
    return workDays;
}

// 计算本月已过的工作日数
function calculateWorkDaysPassed(year, month, currentDay) {
    let workDaysPassed = 0;
    
    for (let day = 1; day <= currentDay; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        
        // 如果是周一至周五，计为工作日
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            workDaysPassed++;
        }
    }
    
    return workDaysPassed;
} 