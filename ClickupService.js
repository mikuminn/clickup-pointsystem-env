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

  const totalSpId = '0d7a032b-6ccc-4633-934b-d7078c1ded9d';
  let totalSp = getCustomFieldValue(taskDetails.custom_fields, totalSpId);
  const totalimportanceId = 'df2fe57b-7678-4b44-971d-fe9acf87e8d1';
  let totalimportance = getCustomFieldValue(taskDetails.custom_fields, totalimportanceId);

  if (totalimportance === 0) {
    console.log("Total importance is zero, cannot divide by zero.");
    return;
  }

  const spPerImportance = totalSp / totalimportance;

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
    let eachSp = eachImportance * spPerImportance;
    const spCustomFieldId = '7c7d79c6-ac5a-40b2-81bb-185097a3c642';
    const updateUrl = `https://api.clickup.com/api/v2/task/${subtask.id}/field/${spCustomFieldId}`;
    const data = JSON.stringify({ "value": eachSp });

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
  const field = customFields.find(field => field.id === fieldId);
  return field ? parseInt(field.value || '0') : 0;
}

function updateTotalCurrentSP(
  clickupApiKey,
  taskId,
  totalCurrentSpCustomFieldId,
  totalSpId,
  totalImportanceId,
  importanceCustomFieldId,
  spCustomFieldId,
) {
  const headers = {
    'Authorization': 'Bearer ' + clickupApiKey,
    'Content-Type': 'application/json'
  };

  const taskUrl = `https://api.clickup.com/api/v2/task/${taskId}?include_subtasks=true`;
  const taskResponse = UrlFetchApp.fetch(taskUrl, { headers });
  const task = JSON.parse(taskResponse.getContentText());

  if (!task.custom_fields) {
    console.log("Custom fields not found in task.");
    return;
  }

  let totalSp = getCustomFieldValue(task.custom_fields, totalSpId);
  let totalImportance = getCustomFieldValue(task.custom_fields, totalImportanceId);

  if (totalImportance === 0) {
    console.log("Total importance is zero, cannot divide by zero.");
    return;
  }

  const spPerImportance = totalSp / totalImportance;
  let totalCurrentSp = 0;

  if (!task.subtasks) {
    console.log("No subtasks found.");
    return;
  }

  task.subtasks.forEach(subtask => {
    const subtaskUrl = `https://api.clickup.com/api/v2/task/${subtask.id}`;
    const subtaskResponse = UrlFetchApp.fetch(subtaskUrl, { headers });
    const subtaskData = JSON.parse(subtaskResponse.getContentText());

    if (!subtaskData.status) return;

    let eachImportance = getCustomFieldValue(subtaskData.custom_fields, importanceCustomFieldId);
    let eachSp = eachImportance * spPerImportance;
    let progressSp = calculateProgressSp(subtaskData.status.status, eachSp);

    totalCurrentSp += progressSp;
  });

  const updateUrl = `https://api.clickup.com/api/v2/task/${taskId}/field/${totalCurrentSpCustomFieldId}`;
  const data = JSON.stringify({ "value": totalCurrentSp });

  const updateResponse = UrlFetchApp.fetch(updateUrl, {
    method: 'POST',
    headers,
    payload: data
  });

  if (updateResponse.getResponseCode() === 200) {
    console.log("Custom field updated successfully.");
  } else {
    console.log("Error occurred: " + updateResponse.getContentText());
  }
}

function calculateProgressSp(status, sp) {
  const statusMultiplier = {
    'to do': 0,
    'in progress': 0.1,
    'processed': 0.5,
    'complete': 1
  };

  return sp * (statusMultiplier[status] || 0);
}