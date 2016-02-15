(function () {
    'use strict';

    var mongodb = require('mongodb');
    var http = require('http');
    var mongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/stocks';
    
    getWatches(getRealTimeQuotes);

    function checkTriggers(realTimeData, watches) {
        var dict = {};
        watches.forEach(function (d) {
            dict[d.symbol] = d;
        });

        realTimeData.forEach(function (d) {
            if (d.Ask >= dict[d.symbol].highTarget) {
                console.log(d.symbol, 'greater than high target with a price of ', d.Ask);
            }
            if (d.Ask <= dict[d.symbol].lowTarget) {
                console.log(d.symbol, 'lower than low target with a price of ', d.Ask);
            }

            if (d.Ask <= d.YearRange.split(' ')[0]) {
                console.log(d.symbol, 'lower than 52 week low with a price of', d.Ask);
            }
            else if (d.Ask >= d.YearRange.split(' ')[2]) {
                console.log(d.symbol, 'higher than 52 week high with a price of', d.Ask);
            }

            if (parseInt(d.ChangeinPercent) >= 20) {
                console.log(d.symbol, 'has a change of more than 20 percent with a price of', d.Ask);
            }
            else if (parseInt(d.ChangeinPercent) >= 10) {
                console.log(d.symbol, 'has a change of more than 10 percent with a price of', d.Ask);
            }
            else if (parseInt(d.ChangeinPercent) >= 5) {
                console.log(d.symbol, 'has a change of more than 5 percent with a price of', d.Ask);
            }
        });
    }

    function getRealTimeQuotes(watches, callback) {
        var symbols = '';
        watches.forEach(function (d) {
            symbols += '"' + d.symbol + '",';
        });
        if (symbols.length > 0) symbols = symbols.slice(0, -1);
        console.log(symbols);
        var url = 'http://query.yahooapis.com/v1/public/yql?q=select * from yahoo.finance.quotes where symbol IN ('
            + symbols + ')&format=json&env=http://datatables.org/alltables.env';
        console.log(url);
        setInterval(
            function () {
                http.get(url, function (response) {
                    var body = '';
                    response.on('data', function (d) {
                        body += d;
                    });
                    response.on('end', function () {
                        var results = JSON.parse(body);
                        callback(results.query.results.quote, watches);
                    });
                });
            },
            1000
        );
    };

    function getWatches(callback) {
        mongoClient.connect(url, function (err, db) {
            if (err) {
                console.log('unable to connect to MongoDB server');
            } else {
                console.log('connected to ' + url);
                db.collection('watches').find({}).toArray(
                    function (err, result) {
                        if (err) {
                            console.log(err);
                        } else {
                            db.close();
                            callback(result, checkTriggers);
                        }
                    }
                );
            }
        });
    }
})();