const axios = require('axios');

const eurusd = "EURUSD"; //ユーロドル
const usdjpy = "USDJPY"; //ドル円
const gbpjpy = "GBPJPY"; //ポンド円

const range_1 = "1";
const range_5 = "5";
const range_15 = "15";
const range_30 = "30";
const range_1H = "60";
const range_D = "day";
const range_W = "week";
const range_M = "month";

var date = new Date();

// Yahoo Financial API
var url = 'https://achart.yahoo.co.jp/fx_data/' + range_D + '/' + eurusd + '.dat?' + date.getTime();

axios.get(url)
    .then( res => {
        //console.log("res.status=" + res.status);
        //console.log("res.headers.date=" + res.headers.date);
        //console.log("res.headers['last-modified']=" + res.headers["last-modified"]);
        //console.log("------------------------------------");
        var collection = [];
        var list = res.data.split(/\n/);
        list.forEach( value => {
           if(value.length != 0){
               var record = value.split(' ');
               var date2 = record[0].replace(/:/g, '/') + " " + record[1];
               var json = {
                   Date: new Date(date2),
                   Open: record[2],
                   High: record[3],
                   Low: record[4],
                   Close: record[5],
                   Volume: 0
                };
                collection.push(json);
            }
        });
        console.log(JSON.stringify(collection));
    })
    .catch(function(error){
        console.log(error);
    });