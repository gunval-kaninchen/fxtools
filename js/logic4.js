/*
チャート作成
 
name:　表の名称
symbol:　通貨ペア
dataset: データ
ma[]: 移動平均設定の配列
fullWidth: 表示幅
fullHeight:　表示高さ
*/
function chart(name, symbol, dataset, ma, fullWidth, fullHeight) {
    
    var dim = {
        width: 960, height: 450,
        margin: { top: 20, right: 50, bottom: 30, left: 50 },
        ohlc: { height: 305 },
        indicator: { height: 65, padding: 5 }
    };
    
    dim.plot = {
        width: dim.width - dim.margin.left - dim.margin.right,
        height: dim.height - dim.margin.top - dim.margin.bottom
    };
    
    dim.indicator.top = dim.ohlc.height+dim.indicator.padding;
    dim.indicator.bottom = dim.indicator.top+dim.indicator.height+dim.indicator.padding;
    
    // 日付フォーマット
    var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L%Z");
        
    // X軸の設定・・techan 取引時間軸の設定（時間枠をWidthに合わせる）
    // ローソク足プロット域
    var x = techan.scale.financetime().range([0, dim.plot.width]);

    // ズーム機能On
    var zoom = d3.zoom().on("zoom", zoomed);
        
    // Y軸の設定・・d3のscaleLinear
    var y = d3.scaleLinear().range([dim.ohlc.height, 0]);

    var yInit, zoomableInit;

    // ローソク足の設定(軸の設定)
    var candlestick = techan.plot.candlestick()
        .xScale(x)
        .yScale(y);
 
    var sma=[];
    ma.forEach((v, i) => {
        // 単純移動平均の設定（軸の設定）
        sma[i] = techan.plot.sma()
            .xScale(x)
            .yScale(y);           
    });

    // トレンドライン
    var trendline = techan.plot.trendline()
        .xScale(x)
        .yScale(y);
    
    // X軸のラベル設定(ラベルを軸の下側
    var xAxis = d3.axisBottom(x);

    // 
    var timeAnnotation = techan.plot.axisannotation()
        .axis(xAxis)
        .orient('bottom')
        .format(d3.timeFormat('%Y-%m-%d'))
        .width(65) 
        .translate([0, dim.plot.height]);
}