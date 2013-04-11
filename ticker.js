
// A macro for google docs that will help you get BTC exchange rates into your excel sheets
// How to Use:
// 1. Create a new google spreadsheet
// 2. Go to Tools -> Script Editor
// 3. Delete everything in the edit window and replace with the code of this file
// 4. Click on the Save button (floppy disk icon)
// 5. Go back to your document and fetch the rate using: =fetchTicker("bitfloor")
// 6. You can replace "bitfloor" with "mtgox" or "bitpay" for the rate you want (you can also get all 3 rates in the same document)

// Written by Ash B - based on the macro by znort987@yahoo.com

function donothammer()
{
    var cache = CacheService.getPublicCache()
    var now = (new Date()).getTime()
    var last = cache.get('last')

    if (null != last) {
        var lastTime = parseInt(last)
        var elapsed = now - lastTime
        var waitFor = 1 - elapsed
        if (0<waitFor)
            Utilities.sleep(waitFor)
    }
    
    cache.put('last', String(now))
}

function fetchCached(url)
{
    var publicCache = CacheService.getPublicCache()
    var cached = publicCache.get(url)

    if (null == cached) {
    
        donothammer()
        
        var response = UrlFetchApp.fetch(url)
        if ('undefined' != typeof(response)) {
            var code = response.getResponseCode()
            if (code<300) {
                var oneMin = 1 * 60
                cached = response.getContentText()
                publicCache.put(url, cached, oneMin)
            }
        }
    }

    return cached
}

function fetchTicker(
    tickerName     // e.g. :  'bitfloor, mtgox, bitpay'
)
{
    var url = "https://api.bitfloor.com/ticker/1"
    // Fetch live data from the ticker
    if (tickerName == 'mtgox')
        url = "https://mtgox.com/api/1/BTCUSD/ticker"
    if (tickerName == 'bitpay')
        url = "https://bitpay.com/api/rates"

    var r = fetchCached(url)
    if ('undefined' == typeof(r))
        return 'No data for ticker ' + tickerName + ' from GLBSE'
        
    r = Utilities.jsonParse(r)
    if ('undefined' == typeof(r))
        return 'Malformed JSON data returned by ticker ' + tickerName
    
    if (tickerName == 'bitpay')
        r = r[0]['rate']
    if (tickerName == 'mtgox')
        r = r['return']['last']['value']
    if (tickerName == 'bitfloor')
        r = r['price']

    if ('undefined' == typeof(r))
        return 'Unknown field ' + fieldName + ' for ticker ' + tickerName

    return r
}

