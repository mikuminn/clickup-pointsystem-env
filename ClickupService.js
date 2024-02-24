function getTaskCustomField(clickupApiKey, taskId, specificCustomFieldId) {
  const headers = {
    'Authorization': 'Bearer ' + clickupApiKey,
    'Content-Type': 'application/json'
  };

  const tasksUrl = `https://api.clickup.com/api/v2/task/${taskId}?include_subtasks=true`;

  let totalImportance = 0;
  const taskDetailsResponse = UrlFetchApp.fetch(tasksUrl, { headers: headers });
  const taskDetails = JSON.parse(taskDetailsResponse.getContentText());

  if (!taskDetails.subtasks) {
    Logger.log("No subtasks found or 'subtasks' key not present in response.");
    return;
  }

  taskDetails.subtasks.forEach(subtask => {
    const subtaskUrl = `https://api.clickup.com/api/v2/task/${subtask.id}`;
    const subtaskResponse = UrlFetchApp.fetch(subtaskUrl, { headers: headers });
    const subtaskDetails = JSON.parse(subtaskResponse.getContentText());

    if (!subtaskDetails.custom_fields) return;

    subtaskDetails.custom_fields.forEach(customField => {
      if (customField.id === specificCustomFieldId) {
        totalImportance += parseInt(customField.value || '0');
      }
    });
  });

  Logger.log("総重要度:" + totalImportance);
  return totalImportance;
}

/** 
 * サブタスクのカスタムフィールドをアップデートする
 */
function updateSubtaskCustomFields(clickupApiKey, taskId) {
  const headers = {
    'Authorization': 'Bearer ' + clickupApiKey,
    'Content-Type': 'application/json'
  };

  const tasksUrl = `https://api.clickup.com/api/v2/task/${taskId}?include_subtasks=true`;

  const taskDetailsResponse = UrlFetchApp.fetch(tasksUrl, { headers: headers });
  const taskDetails = JSON.parse(taskDetailsResponse.getContentText());

  if (!taskDetails.custom_fields) {
    console.log("No custom fields found in task details.");
    return;
  }

  const totalspoopointId = '0d7a032b-6ccc-4633-934b-d7078c1ded9d';
  let totalspoopoint = getCustomFieldValue(taskDetails.custom_fields, totalspoopointId);
  const totalimportanceId = 'df2fe57b-7678-4b44-971d-fe9acf87e8d1';
  let totalimportance = getCustomFieldValue(taskDetails.custom_fields, totalimportanceId);

  if (totalimportance === 0) {
    console.log("Total importance is zero, cannot divide by zero.");
    return;
  }

  const spoopointPerImportance = totalspoopoint / totalimportance;

  if (!taskDetails.subtasks) {
    console.log("No subtasks found or 'subtasks' key not present in response.");
    return;
  }

  taskDetails.subtasks.forEach(subtask => {
    const subtaskUrl = `https://api.clickup.com/api/v2/task/${subtask.id}`;
    const subtaskResponse = UrlFetchApp.fetch(subtaskUrl, { headers: headers });
    const subtaskDetails = JSON.parse(subtaskResponse.getContentText());

    if (!subtaskDetails.custom_fields) return;

    const importanceCustomFieldId = 'c195ffbd-6798-46d5-8792-122b1d9a3dbf';
    let eachImportance = getCustomFieldValue(subtaskDetails.custom_fields, importanceCustomFieldId);
    let eachSpoopoint = eachImportance * spoopointPerImportance;
    const spoopointCustomFieldId = '7c7d79c6-ac5a-40b2-81bb-185097a3c642';
    const updateUrl = `https://api.clickup.com/api/v2/task/${subtask.id}/field/${spoopointCustomFieldId}`;
    const data = JSON.stringify({ "value": eachSpoopoint });

    const updateResponse = UrlFetchApp.fetch(updateUrl, {
      method: 'POST',
      headers: headers,
      payload: data
    });

    if (updateResponse.getResponseCode() === 200) {
      console.log("カスタムフィールドを更新しました。");
    } else {
      console.log("エラーが発生しました: " + updateResponse.getContentText());
    }
  });
}
    
/*
 * 指定の fieldId のカスタムフィールドの値を取得するヘルパー関数
 */
function getCustomFieldValue(customFields, fieldId) {
  for (let i = 0; i < customFields.length; i++) {
    if (customFields[i].id === fieldId) {
      return parseInt(customFields[i].value || '0');
    }
  }
  return 0; // フィールドが見つからない場合は0を返す
}