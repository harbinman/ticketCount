// oracleModel.js

const oracledb = require('oracledb');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 设置自动提交事务（根据需要调整）
oracledb.autoCommit = true;
oracledb.initOracleClient();

// 创建连接池（单例）
let pool;

async function initializePool() {
    if (pool) {
        return pool;
    }

    try {
       // 构建基于 SID 的连接字符串
        //     const connectString = `(DESCRIPTION=
        //   (ADDRESS=(PROTOCOL=TCP)(HOST=${process.env.ORACLE_DB_HOST})(PORT=${process.env.ORACLE_DB_PORT}))
        //   (CONNECT_DATA=(SID=${process.env.ORACLE_DB_SID}))
        // )`;


        

        const connectString = "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=10.1.43.30)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SID=dbc1)))"

        pool = await oracledb.createPool({
            user: process.env.ORACLE_DB_USER,
            password: process.env.ORACLE_DB_PASSWORD,
            connectString: connectString,
            poolMin: 10,      // 最小连接数
            poolMax: 10,      // 最大连接数
            poolIncrement: 0  // 连接池不自动增长
        });
        console.log('Oracle 连接池已创建');
        return pool;
    } catch (err) {
        console.error('创建连接池时发生错误:', err);
        throw err;
    }
}

// 执行 SQL 查询的函数
async function executeSQL(sql, binds = [], options = {}) {
    let connection;

    try {
        // 确保连接池已初始化
        const pool = await initializePool();

        // 从池中获取连接
        connection = await pool.getConnection();

        // 执行查询
        const result = await connection.execute(
            sql,
            binds,
            { outFormat: oracledb.OUT_FORMAT_OBJECT, ...options }
        );

        return result;
    } catch (err) {
        console.error('执行 SQL 时发生错误:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close(); // 释放连接回池
            } catch (err) {
                console.error('释放连接时发生错误:', err);
            }
        }
    }
}

// 关闭连接池的函数（可选，用于应用退出时）
async function closePool() {
    if (pool) {
        try {
            await pool.close(10); // 等待最多 10 秒以完成活动连接
            console.log('Oracle 连接池已关闭');
            pool = null;
        } catch (err) {
            console.error('关闭连接池时发生错误:', err);
            throw err;
        }
    }
}

// 导出函数
module.exports = {
    initializePool,
    executeSQL,
    closePool
};
