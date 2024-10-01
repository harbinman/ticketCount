// db.js
require('dotenv').config();
const mysql = require('mysql2/promise');


// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT, // 如果使用非默认端口，可以在 .env 中配置
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // 根据需要调整
  queueLimit: 0
});

/**
 * 执行数据库查询
 * @param {string} query - SQL 查询语句
 * @param {Array} params - 查询参数
 * @returns {Promise<Array>} - 查询结果
 */
async function queryDatabase(query, params = []) {
  try {
    const [rows, fields] = await pool.query(query, params);
    return rows;
  } catch (err) {
    console.error('查询错误:', err);
    throw err;
  }
}

/**
 * 关闭连接池
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await pool.end();
    console.log('连接池已关闭');
  } catch (err) {
    console.error('关闭连接池时发生错误:', err);
  }
}

module.exports = {
  queryDatabase,
  closePool
};
