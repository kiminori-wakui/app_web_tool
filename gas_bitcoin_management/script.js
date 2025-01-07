function recordBitcoinPrice() {
  // �X�v���b�h�V�[�g��ID�ƃV�[�g�����w��
  var spreadsheetId = 'YOUR_SPREADSHEET_ID'; // �����ɃX�v���b�h�V�[�g��ID�����
  var sheetName = 'BitcoinPrices'; // �����ɃV�[�g�������

  // �X�v���b�h�V�[�g�ƃV�[�g���擾
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  // bitFlyer �� API �G���h�|�C���g
  var tickerUrl = 'https://api.bitflyer.com/v1/getticker?product_code=BTC_JPY';
  var balanceUrl = 'https://api.bitflyer.com/v1/me/getbalance';
  var orderUrl = 'https://api.bitflyer.com/v1/me/sendchildorder';

  // API �L�[�ƃV�[�N���b�g
  var apiKey = 'xxxxx';
  var apiSecret = 'xxxxxx';

  // Ticker API ���N�G�X�g�𑗐M
  var response = UrlFetchApp.fetch(tickerUrl);
  var tickerData = JSON.parse(response.getContentText());
  var price = tickerData.ltp;

  // ���ݓ������擾
  var timestamp = Math.floor(Date.now() / 1000).toString(); // UNIX�^�C���X�^���v

  // ACCESS-SIGN �w�b�_�[�̐���
  var createSignature = function (method, endpoint, body) {
    var text = timestamp + method + endpoint + (body || '');
    var signature = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_SHA_256, text, apiSecret);
    return signature.map(function(e) {
      var v = (e < 0 ? e + 256 : e).toString(16);
      return v.length == 1 ? '0' + v : v;
    }).join('');
  };

  var balanceOptions = {
    'method': 'get',
    'headers': {
      'ACCESS-KEY': apiKey,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-SIGN': createSignature('GET', '/v1/me/getbalance')
    }
  };

  // Balance API ���N�G�X�g�𑗐M
  var balanceResponse = UrlFetchApp.fetch(balanceUrl, balanceOptions);
  var balanceData = JSON.parse(balanceResponse.getContentText());

  // �r�b�g�R�C�����Y�z�Ɠ��{�~���Y�z���擾
  var btcBalance = balanceData.find(function(item) {
    return item.currency_code === 'BTC';
  }).amount;

  var jpyBalance = balanceData.find(function(item) {
    return item.currency_code === 'JPY';
  }).amount;

  // ���v���Y�z�i���{�~���Z�j���v�Z
  var totalAssets = (btcBalance * price) + jpyBalance;

  // ���������L�^����ϐ�
  var orderType = '';
  var orderQuantity = 0.001; // ������

  // ���i�Ɋ�Â��Ĕ�������������
  if (price <= 10500000 && jpyBalance >= orderQuantity * price) {
    orderType = '��������';
    var orderPayload = JSON.stringify({
      'product_code': 'BTC_JPY',
      'child_order_type': 'MARKET',
      'side': 'BUY',
      'size': orderQuantity
    });
    var orderOptions = {
      'method': 'post',
      'headers': {
        'ACCESS-KEY': apiKey,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-SIGN': createSignature('POST', '/v1/me/sendchildorder', orderPayload),
        'Content-Type': 'application/json'
      },
      'payload': orderPayload
    };
    UrlFetchApp.fetch(orderUrl, orderOptions);
  } else if (price >= 11000000 && btcBalance >= orderQuantity) {
    orderType = '���蒍��';
    var orderPayload = JSON.stringify({
      'product_code': 'BTC_JPY',
      'child_order_type': 'MARKET',
      'side': 'SELL',
      'size': orderQuantity
    });
    var orderOptions = {
      'method': 'post',
      'headers': {
        'ACCESS-KEY': apiKey,
        'ACCESS-TIMESTAMP': timestamp,
        'ACCESS-SIGN': createSignature('POST', '/v1/me/sendchildorder', orderPayload),
        'Content-Type': 'application/json'
      },
      'payload': orderPayload
    };
    UrlFetchApp.fetch(orderUrl, orderOptions);
  }

  // �V�[�g�Ƀf�[�^��ǉ�
  sheet.appendRow([timestamp, price, btcBalance, jpyBalance, totalAssets, orderType, orderQuantity]);
}

function createTrigger() {
  // �����̃g���K�[�����ׂč폜
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // �V�����g���K�[���쐬
  ScriptApp.newTrigger('recordBitcoinPrice')
    .timeBased()
    .everyMinutes(1) // 1�����ƂɎ��s
    .create();
}
