

const getFormattedDateTime = () => {

    // 获取当前时间
    const now = new Date();
    // 设置时区偏移（东八区，CST）
    const offset = 8 * 60; // 8小时的偏移量，单位是分钟
    // 计算当前时间的 UTC 毫秒数
    const utcMilliseconds = now.getTime() + (now.getTimezoneOffset() * 60000);
    // 创建新的日期对象，表示中国标准时间
    const cstDate = new Date(utcMilliseconds + (offset * 60000));

    const year = cstDate.getFullYear();
    const month = String(cstDate.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的
    const day = String(cstDate.getDate()).padStart(2, '0');
    const hours = String(cstDate.getHours()).padStart(2, '0');
    const minutes = String(cstDate.getMinutes()).padStart(2, '0');

    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
};


const getFormattedSMSDateTime = () => {
    // 获取当前时间
    const now = new Date();
    // 设置时区偏移（东八区，CST）
    const offset = 8 * 60; // 8小时的偏移量，单位是分钟
    // 计算当前时间的 UTC 毫秒数
    const utcMilliseconds = now.getTime() + (now.getTimezoneOffset() * 60000);
    // 创建新的日期对象，表示中国标准时间
    const cstDate = new Date(utcMilliseconds + (offset * 60000));

    const year = cstDate.getFullYear();
    const month = String(cstDate.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的
    const day = String(cstDate.getDate()).padStart(2, '0');
    const hours = String(cstDate.getHours()).padStart(2, '0');
    const minutes = String(cstDate.getMinutes()).padStart(2, '0');

    // 获取星期几
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[cstDate.getDay()]; // getDay() 返回 0（周日）到 6（周六）

    return `${year}年${month}月${day}日 星期${weekDay} 截至${hours}:${minutes}`;
};
module.exports = {getFormattedDateTime,getFormattedSMSDateTime}