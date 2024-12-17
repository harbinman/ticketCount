const { executeSQL, closePool, initializePool } = require('./utils/oarcleDbConnection');

async function getSMScontent() {
    await initializePool()
    let result;
    const sql2 = `WITH tt AS (
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.NUM DESC) AS rankNo,
            a.*
        FROM (
            -- 第一部分：网络购票入园
            SELECT
                a.name,
                (a.num - (
                    SELECT SUM(num)
                    FROM nss_integration.TB_CHECK_REAL_MONEY
                    WHERE type = '网络购票入园'
                      AND TYPE_REFINE IN ('-当日扫码购', '-线上免票')
                      AND TO_CHAR(UPDATE_TIME, 'YYYY-MM-DD') = TO_CHAR(SYSDATE, 'YYYY-MM-DD')
                )) AS num
            FROM (
                SELECT
                    TYPE AS name,
                    NVL(SUM(num), 0) AS num
                FROM nss_integration.TB_CHECK_REAL_MONEY
                WHERE 1 = 1
                  AND type = '网络购票入园'
                  AND TYPE_REFINE NOT IN ('-当日扫码购', '-线上免票')
                  AND TO_CHAR(UPDATE_TIME, 'YYYY-MM-DD') = TO_CHAR(SYSDATE, 'YYYY-MM-DD')
                GROUP BY TYPE
            ) a
    
            UNION ALL
    
            -- 第二部分：现场购票入园
            SELECT
                a.name,
                (a.num - (
                    SELECT SUM(num)
                    FROM nss_integration.TB_CHECK_REAL_MONEY
                    WHERE type = '现场购票入园'
                      AND TYPE_REFINE IN ('-线下免票', '-放行卡')
                      AND TO_CHAR(UPDATE_TIME, 'YYYY-MM-DD') = TO_CHAR(SYSDATE, 'YYYY-MM-DD')
                )) AS num
            FROM (
                SELECT
                    TYPE AS name,
                    NVL(SUM(num), 0) AS num
                FROM nss_integration.TB_CHECK_REAL_MONEY
                WHERE 1 = 1
                  AND type = '现场购票入园'
                  AND TYPE_REFINE NOT IN ('-线下免票', '-放行卡')
                  AND TO_CHAR(UPDATE_TIME, 'YYYY-MM-DD') = TO_CHAR(SYSDATE, 'YYYY-MM-DD')
                GROUP BY TYPE
            ) a
    
            UNION ALL
    
            -- 第三部分：其他类型
            SELECT
                TYPE AS name,
                NVL(SUM(num), 0) AS num
            FROM nss_integration.TB_CHECK_REAL_MONEY
            WHERE 1 = 1
              AND type NOT IN ('网络购票入园', '现场购票入园')
              AND TO_CHAR(UPDATE_TIME, 'YYYY-MM-DD') = TO_CHAR(SYSDATE, 'YYYY-MM-DD')
            GROUP BY TYPE
    
            UNION ALL

            -- 第三部分：僧团录入
            SELECT  '僧团' as name,
            NVL(SUM(PER_COUNT),0) as num
            FROM nss_integration.TB_TEMPLE_REC_REPORT
            WHERE 1 = 1
                and substr(F_DATE,1,10) = to_char(SYSDATE,'YYYY-MM-DD')
    
            UNION ALL
            -- 第四部分：公务接待入园
            SELECT
                *
            FROM (
                SELECT
                    CASE WHEN SUM(VISIT_NUM) IS NOT NULL THEN '公务接待入园' END AS name,
                    SUM(VISIT_NUM) AS num
                FROM sims_reception.TB_RP_APPLY
                WHERE 1 = 1
                  AND TO_CHAR(APPOINT_TIME, 'YYYY-MM-DD') = TO_CHAR(SYSDATE, 'YYYY-MM-DD')
            )
            WHERE num IS NOT NULL
        ) a
    )
    SELECT
        a.name,
        a.num
    FROM tt a`;


    try {
        result = await executeSQL(sql2);
        return result.rows;
    } catch (err) {
        console.error('获取查询结果时发生错误:', err);
        throw err;
    } finally {
        // 确保在查询完成后关闭连接
        console.log("oracle 数据库关闭")
        await closePool();
    }
}

module.exports = {
    getSMScontent
};
