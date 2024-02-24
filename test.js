function doGet() {
  var response = UrlFetchApp.fetch("https://zipcloud.ibsnet.co.jp/api/search?zipcode=106-0032");
  
  ContentService.createTextOutput()
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  output.setContent(response.getContentText());
  return output;
}
