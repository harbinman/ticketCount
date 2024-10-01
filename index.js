const express = require('express');
const { closePool } = require('./utils/dbConnection');
const getLeaveCount = require('./getLeavingCount');
const getCurrentDateTimeRange = require('./utils/currentDate');
const getInCount = require('./getInCount');
const getFormattedDateTime = require('./getFormatDatetime');

const app = express()


app.get('/', async function (req, res) {
  const { startDateTime, endDateTime } = getCurrentDateTimeRange();
  let leaveCount = 0;
  let inCount = 0;

  try {
    leaveCount = await getLeaveCount(startDateTime, endDateTime);
  } catch (err) {
    console.error('获取离园人数时出错:', err);
    return res.status(500).send('获取离园人数时出错，请稍后重试。');
  }

  try {
    inCount = await getInCount(startDateTime, endDateTime);
  } catch (err) {
    console.error('获取入园人数时出错:', err);
    return res.status(500).send('获取入园人数时出错，请稍后重试。');
  }

  const currentCount = inCount - leaveCount;
  const currentDateTime = getFormattedDateTime();
  res.send(`截至${currentDateTime}，已入园${inCount}人，当前在园人数${currentCount}人`);
});
// 启动服务器
const server = app.listen(3000, () => {
  console.log(`服务器正在监听 http://localhost:3000`);
});

// 在应用程序退出时关闭连接池
process.on('SIGINT', async () => {
  console.log('正在关闭连接池...');
  await closePool();
  console.log('连接池已关闭，程序退出。');
  process.exit(0); // 退出进程
});

// 监听 SIGTERM
process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM，正在关闭连接池...');
  await closePool();
  console.log('连接池已关闭，程序退出。');
  process.exit(0);
});