function recordBitcoinPrice() {
  // スプレッドシートのIDとシート名を指定
  var spreadsheetId = 'YOUR_SPREADSHEET_ID'; // ここにスプレッドシートのIDを入力
  var sheetName = 'BitcoinPrices'; // ここにシート名を入力

  // スプレッドシートとシートを取得
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);

  // bitFlyer の API エンドポイント
  var tickerUrl = 'https://api.bitflyer.com/v1/getticker?product_code=BTC_JPY';
  var balanceUrl = 'https://api.bitflyer.com/v1/me/getbalance';
  var orderUrl = 'https://api.bitflyer.com/v1/me/sendchildorder';

  // API キーとシークレット
  var apiKey = 'xxxxx';
  var apiSecret = 'xxxxxx';

  // Ticker API リクエストを送信
  var response = UrlFetchApp.fetch(tickerUrl);
  var tickerData = JSON.parse(response.getContentText());
  var price = tickerData.ltp;

  // 現在日時を取得
  var timestamp = Math.floor(Date.now() / 1000).toString(); // UNIXタイムスタンプ

  // ACCESS-SIGN ヘッダーの生成
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

  // Balance API リクエストを送信
  var balanceResponse = UrlFetchApp.fetch(balanceUrl, balanceOptions);
  var balanceData = JSON.parse(balanceResponse.getContentText());

  // ビットコイン資産額と日本円資産額を取得
  var btcBalance = balanceData.find(function(item) {
    return item.currency_code === 'BTC';
  }).amount;

  var jpyBalance = balanceData.find(function(item) {
    return item.currency_code === 'JPY';
  }).amount;

  // 合計資産額（日本円換算）を計算
  var totalAssets = (btcBalance * price) + jpyBalance;

  // 注文情報を記録する変数
  var orderType = '';
  var orderQuantity = 0.001; // 注文量

  // 価格に基づいて売買注文を決定
  if (price <= 10500000 && jpyBalance >= orderQuantity * price) {
    orderType = '買い注文';
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
    orderType = '売り注文';
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

  // シートにデータを追加
  sheet.appendRow([timestamp, price, btcBalance, jpyBalance, totalAssets, orderType, orderQuantity]);
}

function createTrigger() {
  // 既存のトリガーをすべて削除
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  // 新しいトリガーを作成
  ScriptApp.newTrigger('recordBitcoinPrice')
    .timeBased()
    .everyMinutes(1) // 1分ごとに実行
    .create();
}
