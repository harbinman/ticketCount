
// utils/getLeaveCount.js
const { queryDatabase } = require('./utils/dbConnection');


async function getLeaveCount(startDateTime, endDateTime) {
    const query = `
      SELECT COUNT(*) AS count
      FROM tkt_leave_info
      WHERE USE_TIME >= ?
        AND USE_TIME <= ?
    `;
    const params = [startDateTime, endDateTime];

    try {
        const rows = await queryDatabase(query, params);
        return rows[0].count; // 返回计数
    } catch (err) {
        console.error('获取出园数量时出错:', err);
        throw err;
    }
}

module.exports =   getLeaveCount;
