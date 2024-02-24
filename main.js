const p = PropertiesService.getScriptProperties();

// APIキー や token 周り
const clickupApiKey = p.getProperty('CLICKUP_API_KEY');

// Clickup の タスクID、カスタムフィールドIDを設定
const taskId = p.getProperty('TASK_ID');
const customFieldId = p.getProperty('CF_ID');
const specificCfId = p.getProperty('SPECIFIC_CF_ID');
const totalCurrentSpCfId = p.getProperty('TOTAL_CURRENT_SP_CF_ID');
const totalSpId = p.getProperty('TOTAL_CURRENT_SP_CF_ID');
const totalImportanceId = p.getProperty('TOTAL_IMPORTANCE_CF_ID');
const importanceCfId = p.getProperty('IMPORTANCE_CF_ID');
const spCfId = p.getProperty('SP_CF_ID');

function doGet() {
  var response = UrlFetchApp.fetch("https://zipcloud.ibsnet.co.jp/api/search?zipcode=106-0032");
  
  ContentService.createTextOutput()
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(response.getContentText());
  return output;
}
