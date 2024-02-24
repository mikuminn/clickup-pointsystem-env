const p = PropertiesService.getScriptProperties();

// APIキー や token 周り
const clickupApiKey = p.getProperty('CLICKUP_API_KEY');

// Clickup の タスクID、カスタムフィールドIDを設定
const taskId = p.getProperty('TASK_ID');
const customFieldId = p.getProperty('CUSTOM_FIELD_ID');
const specificCustomFieldId = p.getProperty('SPECIFIC_CUSTOM_FIELD_ID');

function doGet() {
  var response = UrlFetchApp.fetch("https://zipcloud.ibsnet.co.jp/api/search?zipcode=106-0032");
  
  ContentService.createTextOutput()
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(response.getContentText());
  return output;
}
