function scrapeQoo10() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const url = "https://www.qoo10.jp/shop/yamada-denki";
  const response = UrlFetchApp.fetch(url);
  const html = response.getContentText();
  const $ = Cheerio.load(html);

  const selectors = ['#g_658227614 > div > div.item', '#g_1092959879 > div > div.item'];
  
  const data = [];
  let itemCount = 0;
  
  selectors.forEach(selector => {
    const items = $(selector);
    
    items.each((i, element) => {
      if (itemCount >= 3) return false;
      
      const itemElement = $(element);
      const productUrl = itemElement.find('a.thmb').attr('href');
      const productName = itemElement.find('a.tt').attr('title');
      let price = itemElement.find('.prc strong').text().trim();
      price = price.replace('�~', '').replace(',', '');  // �u�~�v�ƃJ���}�����O

      // ���i�ڍ׃y�[�W����JAN�R�[�h���擾
      const productPageResponse = UrlFetchApp.fetch(productUrl);
      const productPageHtml = productPageResponse.getContentText();
      const $$ = Cheerio.load(productPageHtml);
      const janCode = $$('#tr_pan_industry td[itemprop="mpn"]').text().trim();

      // �y�VAPI���g�p����JAN�R�[�h�Ō���
      const rakutenAppId = 'xxxxx';
      const rakutenApiUrl = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?applicationId=${rakutenAppId}&jan=${janCode}&keyword=${encodeURIComponent(productName)}`;
      const rakutenResponse = UrlFetchApp.fetch(rakutenApiUrl, { muteHttpExceptions: true });
      const rakutenData = JSON.parse(rakutenResponse.getContentText());
      let rakutenPrice = 'N/A';
      
      if (rakutenData.Items && rakutenData.Items.length > 0) {
        rakutenPrice = rakutenData.Items[0].Item.itemPrice;
      }

      const profit = rakutenPrice !== 'N/A' ? rakutenPrice - parseFloat(price) : 'N/A';
      
      data.push([productName, productUrl, price, janCode, rakutenPrice, profit]);
      itemCount++;
    });
  });

  // �X�v���b�h�V�[�g�ɏ�������
  const header = ['���i��', '���iURL', 'Qoo10���i', 'JAN�R�[�h', '�y�V���i', '���v'];
  sheet.clear();
  sheet.appendRow(header);
  
  data.forEach(row => {
    sheet.appendRow(row);
  });
}
