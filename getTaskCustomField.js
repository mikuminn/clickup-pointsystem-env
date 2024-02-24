// APIキー、タスクID、カスタムフィールドIDを設定
const apiKey = PropertiesService.getScriptProperties().getProperty('API_KEY');
const taskId = PropertiesService.getScriptProperties().getProperty('TASK_ID');
const customFieldId = PropertiesService.getScriptProperties().getProperty('CUSTOM_FIELD_ID');

// リクエストヘッダー
const headers = {
  'Authorization': apiKey,
  'Content-Type': 'application/json'
};

// タスクの詳細を取得するURL(include_subtasks=true によりサブタスクを含める)
const tasksUrl = `https://api.clickup.com/api/v2/task/${taskId}?include_subtasks=true`;

function getTaskCustomField() {
  let totalImportance = 0;
  const taskDetailsResponse = UrlFetchApp.fetch(tasksUrl, { headers: headers });
  const taskDetails = JSON.parse(taskDetailsResponse.getContentText());

  if (!taskDetails.subtasks) {
    Logger.log("No subtasks found or 'subtasks' key not present in response.");
    return;
  }
  Logger.log("タスクメイン"+ JSON.stringify(taskDetails));

  taskDetails.subtasks.forEach(subtask => {
    const subtaskUrl = `https://api.clickup.com/api/v2/task/${subtask.id}`;
    const subtaskResponse = UrlFetchApp.fetch(subtaskUrl, { headers: headers });
    const subtaskDetails = JSON.parse(subtaskResponse.getContentText());

    const specificCustomFieldId = 'c195ffbd-6798-46d5-8792-122b1d9a3dbf';
    if (!subtaskDetails.custom_fields) return;

    subtaskDetails.custom_fields.forEach(customField => {
      if (customField.id === specificCustomFieldId) {
        totalImportance += parseInt(customField.value || '0');
      }
    });
    Logger.log("サブメイン"+ JSON.stringify(subtaskDetails));
  });
}