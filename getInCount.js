const { queryDatabase } = require('./utils/dbConnection');

async function getInCount(startDateTime, endDateTime) {
    const query = `
        SELECT 
            SUM(user_count) AS 入园
        FROM (
            SELECT 
                '智游宝APP' AS ordersource,
                SUM(wccd.check_count) AS user_count
            FROM web_certno_check_detail wccd 
            INNER JOIN web_bill_detail wbd FORCE INDEX(idx_suborder_code) ON wccd.sub_order_code = wbd.sub_order_code
            INNER JOIN tkt_ticket_model ttm FORCE INDEX(idx_ticket_code) ON wbd.goods_code = ttm.ticket_code AND ttm.deleted = 'F'  
            INNER JOIN tkt_ticket_type ttt FORCE INDEX(PRIMARY) ON ttm.barcode_type = ttt.id AND ttt.deleted = 'F'
            WHERE 1=1
                AND wccd.MODIFY_TIME >= ?
                AND wccd.MODIFY_TIME <= ?
                AND (wccd.gate_no = 'mobile' OR wccd.gate_ip='online')
                AND ttt.TICKET_TYPE_NAME IN ('入园券', '入园券S')
            UNION ALL
            -- 3天内走实时
            SELECT 
                CASE 
                    WHEN tm.client_type = '4' THEN '线上散客'
                    WHEN tm.client_type = '3' AND tcd.ticket_model_kind IN ('1', '14', '8') THEN '线上团队'
                END AS ordersource,
                tcd.user_count AS user_count
            FROM tkt_checked_dtl tcd FORCE INDEX (idx_use_time)
            JOIN tkt_trade_barcode ttb ON tcd.barcode_id = ttb.id AND ttb.deleted = 'F'
            LEFT JOIN tkt_tradedetail ttd ON ttd.trade_id = ttb.trade_id AND ttd.id = ttb.trade_detail_id AND ttd.deleted = 'F'
            LEFT JOIN tkt_trademain tm ON ttd.trade_id = tm.id AND tm.deleted = 'F'
            WHERE tcd.deleted = 'F'
                AND tcd.business_type = '3'
                AND SUBSTRING(tcd.barcode, 1, 2) != 'WT'
                AND tcd.use_time >= ?
                AND tcd.use_time <= ?
                AND ttd.tickettype_code = 'ETS'
                AND tcd.park_id IN ('10001', '10012', '10024')
                AND tcd.use_time >= DATE_SUB(CURDATE(), INTERVAL 2 DAY)
            UNION ALL
            -- 3天前走统计表
            SELECT 
                CASE 
                    WHEN tcd.client_type = '4' THEN '线上散客'
                    WHEN tcd.client_type = '3' AND tcd.ticket_model_kind IN ('1', '14', '8') THEN '线上团队'
                END AS ordersource,
                tcd.user_count AS user_count
            FROM rpt_day_check_summary_01_d tcd
            WHERE tcd.business_type = '3'
                AND tcd.barcode_prefix != 'WT'
                AND tcd.trade_date >= ?
                AND tcd.trade_date <= ?
                AND tcd.ticket_type_code = 'ETS'
                AND tcd.park_id IN ('10001', '10012', '10024')
                AND tcd.trade_date <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
            UNION ALL
            -- 3天内走实时
            SELECT 
                CASE 
                    WHEN wbm.group_flag = 'F' THEN '线上散客'
                    WHEN wbm.group_flag = 'T' THEN '线上团队'
                END AS ordersource,
                tcd.user_count AS user_count
            FROM tkt_checked_dtl tcd FORCE INDEX (idx_use_time)
            LEFT JOIN web_bill_detail wbd ON tcd.barcode_id = wbd.id AND wbd.deleted = 'F'
            LEFT JOIN web_bill_main wbm ON wbd.order_code = wbm.order_code AND wbm.deleted = 'F'
            LEFT JOIN tkt_ticket_model ttm ON wbd.goods_code = ttm.ticket_code AND ttm.deleted = 'F'
            WHERE tcd.deleted = 'F'
                AND tcd.business_type = '3'
                AND SUBSTRING(tcd.barcode, 1, 2) = 'WT'
                AND tcd.use_time >= ?
                AND tcd.use_time <= ?
                AND ttm.barcode_type = '10027'
                AND tcd.park_id IN ('10001', '10012', '10024')
                AND tcd.use_time >= DATE_SUB(CURDATE(), INTERVAL 2 DAY)
            UNION ALL
            -- 3天前走统计表
            SELECT 
                CASE 
                    WHEN tcd.group_flag = 'F' THEN '线上散客'
                    WHEN tcd.group_flag = 'T' THEN '线上团队'
                END AS ordersource,
                tcd.user_count AS user_count
            FROM rpt_day_check_summary_01_d tcd
            LEFT JOIN tkt_ticket_model ttm ON tcd.goods_code = ttm.ticket_code AND ttm.deleted = 'F'
            WHERE tcd.business_type = '3'
                AND tcd.barcode_prefix = 'WT'
                AND tcd.trade_date >= ?
                AND tcd.trade_date <= ?
                AND ttm.barcode_type = '10027'
                AND tcd.park_id IN ('10001', '10012', '10024')
                AND tcd.trade_date <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
            UNION ALL
            -- 3天内走实时
            SELECT 
                '线下散客' AS ordersource,
                SUM(tcd.user_count) AS user_count
            FROM tkt_checked_dtl tcd FORCE INDEX (idx_use_time)
            WHERE tcd.deleted = 'F'
                AND tcd.use_time >= ?
                AND tcd.use_time <= ?
                AND tcd.park_id IN ('10012', '10001', '10024')
                AND tcd.business_type = '1'
                AND tcd.use_time >= DATE_SUB(CURDATE(), INTERVAL 2 DAY)
            UNION ALL
            -- 3天前走统计表
            SELECT 
                '线下散客' AS ordersource,
                SUM(tcd.user_count) AS user_count
            FROM rpt_day_check_summary_01_d tcd
            WHERE 1 = 1
                AND tcd.trade_date >= ?
                AND tcd.trade_date <= ?
                AND tcd.client_type IN ('9', '4')
                AND tcd.park_id IN ('10012', '10001', '10024')
                AND tcd.business_type = '1'
                AND tcd.trade_date <= DATE_SUB(CURDATE(), INTERVAL 3 DAY)
            UNION ALL
            SELECT 
                xmp.ordersource,
                SUM(xmp.user_count) AS user_count
            FROM (
                SELECT 
                    '70岁老年人' AS ordersource,
                    tcd.cert_no,
                    SUBSTRING(tcd.use_time, 1, 10) AS usetime,
                    1 AS user_count
                FROM tkt_checked_dtl tcd
                WHERE tcd.deleted = 'F'
                    AND tcd.business_type = '4'
                    AND tcd.use_time >= ?
                    AND tcd.use_time <= ?
                GROUP BY tcd.cert_no, SUBSTRING(tcd.use_time, 1, 10)
            ) xmp 
            GROUP BY xmp.ordersource
            UNION ALL
            SELECT 
                '年卡' AS ordersource,
                SUM(detail.check_count) AS user_count
            FROM ic_checkdetail detail
            WHERE detail.deleted = 'F'
                AND detail.create_time >= ?
                AND detail.create_time <= ? AND detail.park_id IN ('10012', '10001', '10024')
        ) tmp 
        WHERE user_count <> 0;
    `;

    const params = [
        startDateTime,
        endDateTime,
        startDateTime,
        endDateTime,
        startDateTime,
        endDateTime,
        startDateTime,
        endDateTime,
        startDateTime,
        endDateTime,
        startDateTime,
        endDateTime,
        startDateTime,
        endDateTime,
        startDateTime,
        endDateTime,
        startDateTime,
        endDateTime
    ];

    try {
        const rows = await queryDatabase(query, params);
        return rows[0].入园; // 返回计数
    } catch (err) {
        console.error('获取入园数量时出错:', err);
        throw err;
    }
}

module.exports = getInCount;
