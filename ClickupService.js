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

/*
 * 指定の fieldId のカスタムフィールドの値を取得するヘルパー関数
 */
function getCfValue(cfs, fieldId) {
  const field = cfs.find(field => field.id === fieldId);
  return field ? parseInt(field.value || '0') : 0;
}

function calculateProgressSp(status, sp) {
  const statusMultiplier = {
    '未対応': 0,
    '作業中': 0.1,
    '作業完了': 0.5,
    'レビュー済み': 1,
    '完了': 1
  };

  return sp * (statusMultiplier[status] || 0);
}

/** 
 * サブタスクのカスタムフィールドをアップデートする
 */
function updateTotalCurrentSp(clickupApiKey, taskId, totalSpId, totalCurrentSpCfId, importanceCfId) {
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

  let totalSp = getCfValue(task.custom_fields, totalSpId);
  let totalImportance = getTotalImportance(clickupApiKey, taskId, importanceCfId);

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

    let eachImportance = getCfValue(subtaskData.custom_fields, importanceCfId);
    let eachSp = eachImportance * spPerImportance;
    let progressSp = calculateProgressSp(subtaskData.status.status, eachSp);

    totalCurrentSp += progressSp;
  });

  const updateUrl = `https://api.clickup.com/api/v2/task/${taskId}/field/${totalCurrentSpCfId}`;
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

  const report = `taskId:${taskId}, 総ポイント:totalSp ,進捗ポイント: ${TotalCurrentSp}, `;

  return report;
}

function getTotalImportance(
  clickupApiKey,
  taskId,
  importanceCfId
) {
  const headers = {
    'Authorization': 'Bearer ' + clickupApiKey,
    'Content-Type': 'application/json'
  };

  const taskUrl = `https://api.clickup.com/api/v2/task/${taskId}?include_subtasks=true`;
  const taskResponse = UrlFetchApp.fetch(taskUrl, { headers: headers });
  const task = JSON.parse(taskResponse.getContentText());

  let totalImportance = 0;

  if (!task.subtasks) {
    console.log("No subtasks found or 'subtasks' key not present in response.");
    return;
  }

  task.subtasks.forEach(subtask => {
    const subtaskUrl = `https://api.clickup.com/api/v2/task/${subtask.id}`;
    const subtaskResponse = UrlFetchApp.fetch(subtaskUrl, { headers: headers });
    const subtaskData = JSON.parse(subtaskResponse.getContentText());

    if (!subtaskData.custom_fields) return;

    subtaskData.custom_fields.forEach(customField => {
      if (customField.id === importanceCfId) {
        totalImportance += parseInt(customField.value || '0');
      }
    });
  });

  return totalImportance;
}