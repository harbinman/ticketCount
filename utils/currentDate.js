const { format } = require('date-fns');

/**
 * 获取当前日期的开始和结束时间
 * @returns {Object} - 包含 startDateTime 和 endDateTime 的对象
 */
function getCurrentDateTimeRange() {
    const now = new Date();

    // 格式化日期
    const dateStr = format(now, 'yyyy-MM-dd');

    // 构建开始时间和结束时间
    const startDateTime = `${dateStr} 00:00:00`;
    const endDateTime = `${dateStr} 23:59:59`;
    const startDateTime1 = `${dateStr} 00:00:00`;
    const endDateTime1 = `${dateStr} 10:00:00`;
    const startDateTime2 = `${dateStr} 10:00:00`;
    const endDateTime2 = `${dateStr} 11:30:00`;
    const startDateTime3 = `${dateStr} 11:30:00`;
    const endDateTime3 = `${dateStr} 13:00:00`;
    const startDateTime4 = `${dateStr} 13:00:00`;
    const endDateTime4 = `${dateStr} 14:30:00`;

    return { startDateTime, endDateTime,startDateTime1,endDateTime1,startDateTime2,endDateTime2,startDateTime3,endDateTime3,startDateTime4,endDateTime4 };
}


module.exports = getCurrentDateTimeRange;