// 假期管理模块

// 假期API地址
const HOLIDAY_API_URL = 'https://holidays.rensr.site/api/holidays';

// 假期信息缓存
let holidayCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 3600000; // 1小时缓存时间（毫秒）

// 获取假期信息
export async function fetchHolidayInfo() {
    const now = Date.now();
    
    // 如果缓存有效，直接返回缓存数据
    if (holidayCache && (now - lastFetchTime < CACHE_DURATION)) {
        return holidayCache;
    }
    
    try {
        const response = await fetch(HOLIDAY_API_URL);
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 更新缓存
        holidayCache = data;
        lastFetchTime = now;
        
        return data;
    } catch (error) {
        console.error('获取假期信息失败:', error);
        
        // 如果有缓存，返回过期的缓存数据
        if (holidayCache) {
            return holidayCache;
        }
        
        // 返回默认数据
        return {
            message: "error",
            next_holiday: {
                date: "未知",
                days_left: 0,
                name: "未知"
            }
        };
    }
}

// 获取下一个假期信息
export async function getNextHoliday() {
    try {
        const holidayData = await fetchHolidayInfo();
        
        if (holidayData && holidayData.next_holiday) {
            return {
                name: holidayData.next_holiday.name,
                date: holidayData.next_holiday.date,
                daysLeft: holidayData.next_holiday.days_left
            };
        } else {
            throw new Error('无法获取下一个假期信息');
        }
    } catch (error) {
        console.error('获取下一个假期信息失败:', error);
        return {
            name: "未知",
            date: "未知",
            daysLeft: 0
        };
    }
}

// 格式化日期
export function formatDate(dateString) {
    if (dateString === "未知") return "未知";
    
    try {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}年${month}月${day}日`;
    } catch (error) {
        console.error('日期格式化失败:', error);
        return dateString;
    }
} 