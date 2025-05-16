// 计算器模块
import { getConfig, calculateWorkHours, calculateTotalWorkMinutes } from './config.js';

// 存储上次计算的收入和每秒收入率
let lastEarnings = 0;
let secondRate = 0;
// 保存最后一个工作日的收入（用于调整模式）
let lastWorkdayEarnings = 0;

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
    
    // 计算总工作时间（秒）
    const totalWorkSeconds = workEndSeconds - workStartSeconds;
    
    // 午休时间（秒），不能超过总工作时间
    const lunchBreakSeconds = Math.min(totalWorkSeconds, config.lunchBreak * 60);
    
    // 实际工作时间（秒）
    const totalWorkSecondsNet = Math.max(1, totalWorkSeconds - lunchBreakSeconds);
    
    // 基础小时工资率
    const baseHourlyWage = dailySalary / (totalWorkSecondsNet / 3600);
    const baseMinuteWage = baseHourlyWage / 60;
    
    // 根据当前时间调整费率
    let adjustedHourlyWage = baseHourlyWage;
    let adjustedMinuteWage = baseMinuteWage;
    
    // 如果在工作时间内
    if (currentSeconds >= workStartSeconds && currentSeconds <= workEndSeconds) {
        // 计算剩余工作时间（秒）
        let remainingWorkSeconds = workEndSeconds - currentSeconds;
        
        // 计算已经过去的工作时间（秒）
        let elapsedWorkSeconds = currentSeconds - workStartSeconds;
        
        // 午休开始时间设为工作时间的中点
        const lunchStartSeconds = workStartSeconds + Math.floor((totalWorkSeconds - lunchBreakSeconds) / 2);
        
        // 调整已经过去的工作时间，考虑午休
        if (currentSeconds > lunchStartSeconds) {
            const lunchElapsed = Math.min(lunchBreakSeconds, currentSeconds - lunchStartSeconds);
            elapsedWorkSeconds = Math.max(0, elapsedWorkSeconds - lunchElapsed);
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
        
        // 如果还有剩余工作时间，根据剩余工作时间调整费率
        if (totalWorkSecondsNet > 0) {
            // 计算剩余工资
            const remainingSalary = dailySalary - (dailySalary * (elapsedWorkSeconds / totalWorkSecondsNet));
            
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
    const currentDay = now.getDate();
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
    
    // 当前时间（秒）
    const currentSeconds = (currentHour * 60 + currentMinute) * 60 + currentSecond;
    
    // 判断今天是否是工作日（1~workDays号为工作日）
    const isWorkday = currentDay <= config.workDays;
    
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
        
        // 午休开始时间设为工作时间的中点
        const lunchStartSeconds = workStartSeconds + Math.floor((totalWorkSeconds - lunchBreakSeconds) / 2);
        
        // 减去午休时间（如果处于午休之后）
        if (currentSeconds > lunchStartSeconds) {
            const lunchElapsed = Math.min(lunchBreakSeconds, currentSeconds - lunchStartSeconds);
            workedSeconds = Math.max(0, workedSeconds - lunchElapsed);
        }
    }
    
    // 计算工作时间（小时和分钟）
    const hours = Math.floor(workedSeconds / 3600);
    const minutes = Math.floor((workedSeconds % 3600) / 60);
    
    // 计算收入 (秒级精度)，确保为正数
    let earnings = Math.max(0, workedSeconds * secondRate);
    
    // 如果今天是工作日后（非工作日），但用户打开了程序
    if (!isWorkday) {
        // 保存最后一个工作日的收入（如果是第一次打开，这个值为0）
        if (lastWorkdayEarnings === 0) {
            // 计算最后一个工作日的总收入
            const dailySalary = config.monthlySalary / config.workDays;
            lastWorkdayEarnings = dailySalary;
        }
        
        // 将今天的实时收入替代最后一个工作日的收入
        earnings = Math.max(0, workedSeconds * secondRate);
    } else if (currentDay === config.workDays) {
        // 如果是最后一个工作日，保存其收入
        lastWorkdayEarnings = earnings;
    }
    
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
    
    // 月薪
    const monthlySalary = config.monthlySalary;
    
    // 每日工资
    const dailySalary = monthlySalary / config.workDays;
    
    // 判断今天是否是工作日（1~workDays号为工作日）
    const isWorkday = currentDay <= config.workDays;
    
    let monthEarnings = 0;
    
    if (isWorkday) {
        // 正常情况（1~workDays号）
        // 计算本月已过工作日数（包括今天）
        const workDaysPassed = Math.min(currentDay, config.workDays);
        
        // 计算本月已赚收入（不包括今天）
        monthEarnings = dailySalary * (workDaysPassed - 1);
        
        // 加上今天的实时收入
        const todayEarnings = calculateTodayEarnings().earnings;
        monthEarnings += todayEarnings;
    } else {
        // 调整情况（workDays号之后）
        // 计算前(workDays-1)天的收入
        monthEarnings = dailySalary * (config.workDays - 1);
        
        // 加上今天的实时收入（代替最后一个工作日）
        const todayEarnings = calculateTodayEarnings().earnings;
        monthEarnings += todayEarnings;
    }
    
    return monthEarnings;
}

// 计算今年已赚收入
export function calculateYearEarnings() {
    const config = getConfig();
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-11
    
    let totalEarnings = 0;
    
    // 计算已过完整月份的收入
    for (let month = 0; month < currentMonth; month++) {
        totalEarnings += config.monthlySalary;
    }
    
    // 添加当月已赚收入
    totalEarnings += calculateMonthEarnings();
    
    return totalEarnings;
}