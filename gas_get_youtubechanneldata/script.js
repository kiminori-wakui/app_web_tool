function getYouTubeChannelData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var startRow = 2; // Assuming the first row is headers
  var apiService = YouTube; // YouTube Data API service
  
  for (var i = startRow; i <= lastRow; i++) {
    var url = sheet.getRange(i, 1).getValue();
    var channelId = extractChannelId(url);
    if (channelId) {
      try {
        var response = apiService.Channels.list('snippet,statistics', { forUsername: channelId });
        var channelName = response.items[0].snippet.title;
        var subscribers = response.items[0].statistics.subscriberCount;
        sheet.getRange(i, 2).setValue(channelName);
        sheet.getRange(i, 3).setValue(subscribers);
      } catch (e) {
        Logger.log('Error fetching data for URL: ' + url + ' - ' + e.message);
        sheet.getRange(i, 2).setValue('Error');
        sheet.getRange(i, 3).setValue('Error');
      }
    } else {
      sheet.getRange(i, 2).setValue('Invalid URL');
      sheet.getRange(i, 3).setValue('Invalid URL');
    }
  }
}

function extractChannelId(url) {
  var regex = /https:\/\/www\.youtube\.com\/@([^\/]+)/;
  var match = url.match(regex);
  return match ? match[1] : null;
}
