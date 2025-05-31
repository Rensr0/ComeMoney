// 配置管理模块

// 工作时间配置
let config = {
    monthlySalary: 10000,
    workDays: 22,
    startTime: '09:00',
    endTime: '18:00',
    lunchBreak: 0,
    decimalPlaces: 2
};

// 初始化配置
export function initConfig() {
    // 检查URL参数，如果有参数则直接加载
    const urlParseResult = parseUrlParams();
    
    // 如果URL参数解析失败，尝试从localStorage加载
    if (!urlParseResult.success) {
        // 从localStorage加载保存的设置
        loadFromLocalStorage();
    }
    
    // 更新表单值
    updateFormValues();
    
    // 返回配置状态
    return {
        hasConfig: !!localStorage.getItem('workConfig'),
        fromUrl: urlParseResult.fromUrl,
        urlImportSuccess: urlParseResult.success
    };
}

// 从localStorage加载配置
function loadFromLocalStorage() {
    const savedConfig = localStorage.getItem('workConfig');
    if (savedConfig) {
        try {
            const parsedConfig = JSON.parse(savedConfig);
            // 验证配置是否完整
            if (parsedConfig.monthlySalary && parsedConfig.workDays && 
                parsedConfig.startTime && parsedConfig.endTime) {
                config = parsedConfig;
                return true;
            }
        } catch (error) {
            console.error('解析保存的配置失败:', error);
        }
    }
    return false;
}

// 更新表单值
function updateFormValues() {
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

// 解析URL参数
function parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = urlParams.get('config');
    
    if (!params) {
        return { success: false, fromUrl: false };
    }
    
    try {
        // 解码并解析参数
        const decodedParams = decodeURIComponent(params);
        const parsedConfig = JSON.parse(atob(decodedParams));
        
        // 验证参数是否完整
        if (!parsedConfig.monthlySalary || !parsedConfig.workDays || 
            !parsedConfig.startTime || !parsedConfig.endTime) {
            return { success: false, fromUrl: true };
        }
        
        // 更新配置
        config = {
            monthlySalary: parseFloat(parsedConfig.monthlySalary),
            workDays: parseInt(parsedConfig.workDays),
            startTime: parsedConfig.startTime,
            endTime: parsedConfig.endTime,
            lunchBreak: parseInt(parsedConfig.lunchBreak || 0),
            decimalPlaces: parseInt(parsedConfig.decimalPlaces || 2)
        };
        
        return { success: true, fromUrl: true };
    } catch (error) {
        console.error('解析URL参数错误:', error);
        return { success: false, fromUrl: true };
    }
}

// 保存设置
export function saveSettings(e) {
    if (e) e.preventDefault();
    
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
        return false;
    }
    
    // 保存到localStorage
    localStorage.setItem('workConfig', JSON.stringify(config));
    
    return true;
}

// 获取当前配置
export function getConfig() {
    return config;
}

// 计算总工作分钟数（不包括午休）
export function calculateTotalWorkMinutes() {
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

// 计算每日工作小时数
export function calculateWorkHours() {
    const totalMinutes = calculateTotalWorkMinutes();
    
    // 转换为小时，确保至少为0.1小时，避免除以零
    return Math.max(0.1, totalMinutes / 60);
}

// 生成当前配置的分享链接
export function generateConfigShareLink() {
    // 获取当前配置
    const currentConfig = {
        monthlySalary: parseFloat(document.getElementById('monthlySalary').value),
        workDays: parseInt(document.getElementById('workDays').value),
        startTime: document.getElementById('startTime').value,
        endTime: document.getElementById('endTime').value,
        lunchBreak: parseInt(document.getElementById('lunchBreak').value),
        decimalPlaces: parseInt(document.getElementById('decimalPlaces').value)
    };
    
    // 验证配置是否有效
    if (!currentConfig.monthlySalary || !currentConfig.workDays || 
        !currentConfig.startTime || !currentConfig.endTime) {
        return null;
    }
    
    // 将配置转换为Base64编码
    const configString = JSON.stringify(currentConfig);
    const encodedConfig = btoa(configString);
    
    // 使用官方网站URL进行分享，避免使用localhost无法访问
    const officialBaseUrl = "https://game.rensr.site/come_money/";
    const url = new URL(officialBaseUrl);
    url.search = `?config=${encodeURIComponent(encodedConfig)}`;
    
    return url.toString();
} 