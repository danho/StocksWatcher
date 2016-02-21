module.exports = function checkTriggers(realTimeData, watches, socket) {
    'use strict';
    var dict = {};
    watches.forEach(function (d) {
        dict[d.symbol] = d;
    });

    var isArray = Array.isArray(realTimeData);
    if(!isArray){
        realTimeData = [realTimeData];
    }

    realTimeData.forEach(function (d) {

        if (!socket) {
            console.log('socket undefined');
        }
        if (d.Ask >= dict[d.symbol].highTarget) {
            console.log(d.symbol, 'greater than high target with a price of ', d.Ask);
            socket.emit(d.symbol, d.symbol + ' greater than high target with a price of ' + d.Ask)
        }
        if (d.Ask <= dict[d.symbol].lowTarget) {
            console.log(d.symbol, 'lower than low target with a price of ', d.Ask);
            socket.emit(d.symbol, d.symbol + ' lower than low target with a price of ' + d.Ask)
        }

        if (d.Ask <= d.YearRange.split(' ')[0]) {
            console.log(d.symbol, 'lower than 52 week low with a price of', d.Ask);
            socket.emit(d.symbol, d.symbol + ' lower than 52 week low with a price of' + d.Ask)
        }
        else if (d.Ask >= d.YearRange.split(' ')[2]) {
            console.log(d.symbol, 'higher than 52 week high with a price of', d.Ask);
            socket.emit(d.symbol, d.symbol + ' higher than 52 week high with a price of' + d.Ask)
        }

        if (parseInt(d.ChangeinPercent) >= 20) {
            console.log(d.symbol, 'has a change of more than 20 percent with a price of', d.Ask);
            socket.emit(d.symbol, d.symbol + ' has a change of more than 20 percent with a price of' + d.Ask);
        }
        else if (parseInt(d.ChangeinPercent) >= 10) {
            console.log(d.symbol, 'has a change of more than 10 percent with a price of', d.Ask);
            socket.emit(d.symbol, d.symbol + ' has a change of more than 10 percent with a price of' + d.Ask);
        }
        else if (parseInt(d.ChangeinPercent) >= 5) {
            console.log(d.symbol, 'has a change of more than 5 percent with a price of', d.Ask);
            socket.emit(d.symbol, d.symbol + ' has a change of more than 5 percent with a price of' + d.Ask)
        }
    });
}

