// 计算器模块
import { getConfig, calculateWorkHours, calculateTotalWorkMinutes } from './config.js';

// 存储上次计算的收入和每秒收入率
let lastEarnings = 0;
let secondRate = 0;
// 保存最后一个工作日的收入（用于调整模式）
let lastWorkdayEarnings = 0;

// 检查是否是夜班模式（上班时间晚于下班时间）
function isNightShift(startTime, endTime) {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    // 如果开始时间大于结束时间，则视为夜班
    return (startHour > endHour) || (startHour === endHour && startMinute > endMinute);
}

// 计算工作开始和结束的时间戳（秒）
function calculateWorkTimeInSeconds(config) {
    const [startHour, startMinute] = config.startTime.split(':').map(Number);
    const [endHour, endMinute] = config.endTime.split(':').map(Number);
    
    // 计算开始时间（秒）
    const workStartSeconds = (startHour * 60 + startMinute) * 60;
    
    // 计算结束时间（秒）
    let workEndSeconds = (endHour * 60 + endMinute) * 60;
    
    // 如果是夜班，结束时间需要加上24小时
    if (isNightShift(config.startTime, config.endTime)) {
        workEndSeconds += 24 * 60 * 60; // 加上24小时的秒数
    }
    
    return { workStartSeconds, workEndSeconds };
}

// 计算每小时、每分钟和每秒的收入率
export function calculateRates() {
    const config = getConfig();
    const dailySalary = config.monthlySalary / config.workDays;
    
    // 获取当前时间
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // 当前时间（秒）
    const currentSeconds = (currentHour * 60 + currentMinute) * 60 + currentSecond;
    
    // 计算工作时间（秒）
    const { workStartSeconds, workEndSeconds } = calculateWorkTimeInSeconds(config);
    
    // 计算总工作时间（秒）
    const totalWorkSeconds = workEndSeconds - workStartSeconds;
    
    // 休息时间（秒），不能超过总工作时间
    const breakSeconds = Math.min(totalWorkSeconds, config.lunchBreak * 60);
    
    // 实际工作时间（秒）
    const totalWorkSecondsNet = Math.max(1, totalWorkSeconds - breakSeconds);
    
    // 基础小时工资率
    const baseHourlyWage = dailySalary / (totalWorkSecondsNet / 3600);
    const baseMinuteWage = baseHourlyWage / 60;
    
    // 根据当前时间调整费率
    let adjustedHourlyWage = baseHourlyWage;
    let adjustedMinuteWage = baseMinuteWage;
    
    // 处理当前时间，考虑夜班情况
    let adjustedCurrentSeconds = currentSeconds;
    if (isNightShift(config.startTime, config.endTime) && currentSeconds < workStartSeconds && currentSeconds < workEndSeconds - 24 * 60 * 60) {
        // 如果是夜班，且当前时间在零点后、下班时间前，需要加上24小时
        adjustedCurrentSeconds += 24 * 60 * 60;
    }
    
    // 如果在工作时间内
    if (adjustedCurrentSeconds >= workStartSeconds && adjustedCurrentSeconds <= workEndSeconds) {
        // 计算剩余工作时间（秒）
        let remainingWorkSeconds = workEndSeconds - adjustedCurrentSeconds;
        
        // 计算已经过去的工作时间（秒）
        let elapsedWorkSeconds = adjustedCurrentSeconds - workStartSeconds;
        
        // 休息开始时间设为工作时间的中点
        const breakStartSeconds = workStartSeconds + Math.floor((totalWorkSeconds - breakSeconds) / 2);
        
        // 调整已经过去的工作时间，考虑休息
        if (adjustedCurrentSeconds > breakStartSeconds) {
            const breakElapsed = Math.min(breakSeconds, adjustedCurrentSeconds - breakStartSeconds);
            elapsedWorkSeconds = Math.max(0, elapsedWorkSeconds - breakElapsed);
        }
        
        // 计算实际剩余工作时间（考虑休息）
        let adjustedRemainingSeconds = remainingWorkSeconds;
        if (adjustedCurrentSeconds < breakStartSeconds) {
            // 如果休息还没开始，从剩余时间中减去休息
            adjustedRemainingSeconds = Math.max(0, remainingWorkSeconds - breakSeconds);
        } else if (adjustedCurrentSeconds < breakStartSeconds + breakSeconds) {
            // 如果正在休息，调整剩余时间
            const remainingBreak = breakStartSeconds + breakSeconds - adjustedCurrentSeconds;
            adjustedRemainingSeconds = Math.max(0, remainingWorkSeconds - remainingBreak);
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
    
    // 当前时间（秒）
    const currentSeconds = (currentHour * 60 + currentMinute) * 60 + currentSecond;
    
    // 计算工作时间（秒）
    const { workStartSeconds, workEndSeconds } = calculateWorkTimeInSeconds(config);
    
    // 计算总工作时间（秒）
    const totalWorkSeconds = workEndSeconds - workStartSeconds;
    
    // 休息时间（秒），不能超过总工作时间
    const breakSeconds = Math.min(totalWorkSeconds, config.lunchBreak * 60);
    
    // 判断今天是否是工作日（1~workDays号为工作日）
    const isWorkday = currentDay <= config.workDays;
    
    // 处理当前时间，考虑夜班情况
    let adjustedCurrentSeconds = currentSeconds;
    if (isNightShift(config.startTime, config.endTime) && currentSeconds < workStartSeconds && currentSeconds < workEndSeconds - 24 * 60 * 60) {
        // 如果是夜班，且当前时间在零点后、下班时间前，需要加上24小时
        adjustedCurrentSeconds += 24 * 60 * 60;
    }
    
    // 计算已工作秒数（考虑休息）
    let workedSeconds = 0;
    
    // 如果还没开始工作
    if (adjustedCurrentSeconds < workStartSeconds) {
        workedSeconds = 0;
    } 
    // 如果已经下班
    else if (adjustedCurrentSeconds > workEndSeconds) {
        workedSeconds = Math.max(0, totalWorkSeconds - breakSeconds);
    }
    // 如果在工作时间内
    else {
        workedSeconds = adjustedCurrentSeconds - workStartSeconds;
        
        // 休息开始时间设为工作时间的中点
        const breakStartSeconds = workStartSeconds + Math.floor((totalWorkSeconds - breakSeconds) / 2);
        
        // 减去休息时间（如果处于休息之后）
        if (adjustedCurrentSeconds > breakStartSeconds) {
            const breakElapsed = Math.min(breakSeconds, adjustedCurrentSeconds - breakStartSeconds);
            workedSeconds = Math.max(0, workedSeconds - breakElapsed);
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
    
    // 当前时间（秒）
    const currentSeconds = (currentHour * 60 + currentMinute) * 60 + currentSecond;
    
    // 计算工作时间（秒）
    const { workStartSeconds, workEndSeconds } = calculateWorkTimeInSeconds(config);
    
    // 计算总工作时间（秒）
    const totalWorkSeconds = workEndSeconds - workStartSeconds;
    
    // 休息时间（秒），不能超过总工作时间
    const breakSeconds = Math.min(totalWorkSeconds, config.lunchBreak * 60);
    
    // 实际工作时间（秒）
    const totalWorkSecondsNet = Math.max(1, totalWorkSeconds - breakSeconds);
    
    // 处理当前时间，考虑夜班情况
    let adjustedCurrentSeconds = currentSeconds;
    if (isNightShift(config.startTime, config.endTime) && currentSeconds < workStartSeconds && currentSeconds < workEndSeconds - 24 * 60 * 60) {
        // 如果是夜班，且当前时间在零点后、下班时间前，需要加上24小时
        adjustedCurrentSeconds += 24 * 60 * 60;
    }
    
    // 计算进度百分比
    let progress = 0;
    
    // 如果还没开始工作
    if (adjustedCurrentSeconds < workStartSeconds) {
        progress = 0;
    } 
    // 如果已经下班
    else if (adjustedCurrentSeconds > workEndSeconds) {
        progress = 100;
    }
    // 如果在工作时间内
    else {
        // 休息开始时间设为工作时间的中点
        const breakStartSeconds = workStartSeconds + Math.floor((totalWorkSeconds - breakSeconds) / 2);
        
        if (adjustedCurrentSeconds < breakStartSeconds) {
            // 休息前
            progress = ((adjustedCurrentSeconds - workStartSeconds) / totalWorkSecondsNet) * 100;
        } else if (adjustedCurrentSeconds < breakStartSeconds + breakSeconds) {
            // 休息中
            progress = ((breakStartSeconds - workStartSeconds) / totalWorkSecondsNet) * 100;
        } else {
            // 休息后
            const afterBreakSeconds = adjustedCurrentSeconds - (breakStartSeconds + breakSeconds);
            progress = ((breakStartSeconds - workStartSeconds + afterBreakSeconds) / totalWorkSecondsNet) * 100;
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