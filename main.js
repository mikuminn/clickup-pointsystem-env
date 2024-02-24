import ClickupService from "./ClickupService";
const p = PropertiesService.getScriptProperties();

// APIキー や token 周り
const clickupApiKey = p.getProperty('CLICKUP_API_KEY');
const slackToken = p.getProperty('SLACK_TOKEN');

// Clickup の タスクID、カスタムフィールドIDを設定
const taskId = p.getProperty('TASK_ID');
const totalSpId = p.getProperty('TOTAL_SP_CF_ID');
const totalCurrentSpCfId = p.getProperty('TOTAL_CURRENT_SP_CF_ID');
const importanceCfId = p.getProperty('IMPORTANCE_CF_ID');

// Slack の チャンネルなどなど
const channelId=  p.getProperty('CHANNEL_ID');

function doGet() {
  var response = UrlFetchApp.fetch("https://zipcloud.ibsnet.co.jp/api/search?zipcode=106-0032");
  
  ContentService.createTextOutput()
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(response.getContentText());
  return output;
}

/**
 * Clickupのステータスチェンジ時に送られる想定
 */
function doPost(param) {
  const report = ClickupService.updateTotalCurrentSp(
    clickupApiKey,
    taskId,
    totalCurrentSpCfId,
    totalSpId,
    importanceCfId,
  );
  SlackService.postToChannel(slackToken, channelId, "", report)
}
