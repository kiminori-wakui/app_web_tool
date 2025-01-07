function searchEmails() {
  const apiKey = 'xxxx';
  const cx = 'xxxx';
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) { // Assuming the first row is headers
    const phoneNumber = data[i][0];
    if (phoneNumber) {
      const searchQuery = `${phoneNumber} メールアドレス`;
      const email = searchEmailUsingApi(searchQuery, apiKey, cx);
      sheet.getRange(i + 1, 2).setValue(email); // Assuming email addresses go into the second column
    }
  }
}

function searchEmailUsingApi(query, apiKey, cx) {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${apiKey}&cx=${cx}`;
  const response = UrlFetchApp.fetch(url);
  const json = JSON.parse(response.getContentText());
  
  if (json.items && json.items.length > 0) {
    const pageContent = UrlFetchApp.fetch(json.items[0].link).getContentText();
    return extractEmailFromText(pageContent);
  }
  
  return 'Email not found';
}

function extractEmailFromText(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailRegex);
  return match ? match[0] : 'Email not found';
}
