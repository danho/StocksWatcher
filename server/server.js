(function () {
    'use strict';

    var mongodb = require('mongodb');
    var http = require('http');
    var mongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/stocks';

    var checkTriggers = require("./checkTriggers");
    getWatches(getRealTimeQuotes);

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