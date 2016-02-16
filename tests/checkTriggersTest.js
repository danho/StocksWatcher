var checkTriggers = require("../server/checkTriggers.js");

  var watchesArray = sampleWatches(); 
var realTimeData = sampleRealTimeData();
 checkTriggers(realTimeData, watchesArray);  

function sampleWatches(){ 
    var watch1 = { highTarget: 10, lowTarget: 1, symbol: "aapl" }; 
    var watch2 = { highTarget: 20, lowTarget: 2, symbol: "googl" };
    var arr = [ watch1, watch2 ]; 
    return arr;
 }

  function sampleRealTimeData(){
      var realTimeData = { Ask: 90, symbol: "aapl", YearRange: "92.00 - 134.54"};
      return realTimeData; 
}
