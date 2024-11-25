const express = require('express');
const { closePool } = require('./utils/dbConnection');
const getLeaveCount = require('./getLeavingCount');
const getCurrentDateTimeRange = require('./utils/currentDate');
const getInCount = require('./getInCount');
const { getFormattedDateTime, getFormattedSMSDateTime } = require('./getFormatDatetime');
const { getSMScontent } = require('./getSMScontent')
const app = express()


app.get('/count', async function (req, res) {
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

app.get('/sms', async function (req, res) {
  const { startDateTime1, endDateTime1, startDateTime2, endDateTime2, startDateTime3, endDateTime3, startDateTime4, endDateTime4 } = getCurrentDateTimeRange();
  // 初始化变量
  let onlineEntry = 0;
  let onSiteEntry = 0;
  let monk = 0;
  let teamEntry = 0;
  let policyFreeEntry = 0;
  let officialReception = 0; // 公务接待的结果，如果存在将其赋值
  let total = 0;
  let section1 = 0;
  let section2 = 0;
  let section3 = 0;
  let section4 = 0;
  let section5 = 0;
  try {
    const data = await getSMScontent();
    // 遍历数据并保存到相应的变量中
    data.forEach(item => {
      switch (item.NAME) {
        case '网络购票入园':
          onlineEntry = item.NUM;
          break;
        case '现场购票入园':
          onSiteEntry = item.NUM;
          break;
        case '团队购票入园':
          teamEntry = item.NUM;
          break;
        case '政策性免费入园':
          policyFreeEntry = item.NUM;
          break;
        case '公务接待入园':
          officialReception = item.NUM;
          break;
        case '僧团':
          monk = item.NUM;
          break;
        default:
          break;
      }
    });
    total = onlineEntry + onSiteEntry + teamEntry + policyFreeEntry + monk + officialReception;
  } catch (error) {
    console.error('获取短信内容出错:', error);
    return res.status(500).send('获取短信内容出错，请稍后重试。');
  }
  try {
    section1 = await getInCount(startDateTime1, endDateTime1);
    section2 = await getInCount(startDateTime2, endDateTime2);
    section3 = await getInCount(startDateTime3, endDateTime3);
    section4 = await getInCount(startDateTime4, endDateTime4);
    section5 = total - section1 - section2 - section3 - section4;

  } catch (err) {
    console.error('获取入园人数时出错:', err);
    return res.status(500).send('获取入园人数时出错，请稍后重试。');
  }

  const currenSMSDateTime = getFormattedSMSDateTime();

  res.send(`${currenSMSDateTime}，全天入园${total}人。其中：
            1.网络预约票${onlineEntry}人；
            2.现场预约票（含年卡）${onSiteEntry}人；
            3.团队预约票${teamEntry}人；
            4.政策性免费预约票（现役军人、退役军人、消防救援人员、南京市医务人员、老人儿童等优待人群）${policyFreeEntry + monk}人；
            5.公务接待${officialReception}人。
            <br> 
            <br> 
            ${currenSMSDateTime}，全天入园${total}人。其中：检票入园${total - officialReception}人，公务接待${officialReception}人。<br> 
            1.08:30-10:00检票入园${section1}人;<br> 
            2.10:00-11:30检票入园${section2}人;<br> 
            3.11:30-13:00检票入园${section3}人;<br> 
            4.13:00-14:30检票入园${section4}人;<br> 
            5.14:30-16:30检票入园${section5}人。
            `);
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