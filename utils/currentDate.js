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

    return { startDateTime, endDateTime };
}


module.exports = getCurrentDateTimeRange;