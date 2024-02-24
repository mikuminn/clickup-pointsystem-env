/**
 * チャンネルにポストする
 */
function postToChannel(token, channelId, timePretext, report){
  // Slack API を叩いてprofileを更新する
  const url = "https://slack.com/api/chat.postMessage";
  const parameter = {
    "token": token,
    "channel": channelId,
    "attachments": JSON.stringify([{"pretext":timePretext,"text": report}])
  };
  Util.doRequestWithParameter(url,'POST', parameter);  
}
