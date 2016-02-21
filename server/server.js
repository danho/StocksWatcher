(function () {
    'use strict';

    var mongodb = require('mongodb');
    var http = require('http');
    var express = require('express');
    var path = require('path');
    var io = require('socket.io');
    var app = express();
    var server = http.createServer(app);
    io = io.listen(server);
    server.listen(8080);

    var socket;

    app.use('/public', express.static(path.join(__dirname, '/../public')));

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, '/../client/hello.html'));
    });

    var mongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/stocks';

    var checkTriggers = require("./checkTriggers");

    io.sockets.on('connection', function (_socket) {
        socket = _socket;
        console.log('socket connected');
        getWatches(getRealTimeQuotes);
    });

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
                        callback(results.query.results.quote, watches, socket);
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