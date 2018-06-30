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

        // マージンの設定    
        var margin = {top: 20, right: 30, bottom: 30, left: 30},
            width = fullWidth - margin.left - margin.right,
            height = fullHeight - margin.top - margin.bottom;
        
        // 日付フォーマット
        var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L%Z");
        
        // X軸の設定・・techan 取引時間軸の設定（時間枠をWidthに合わせる）
        var x = techan.scale.financetime().range([0, width]);

        // ズーム機能On
        var zoom = d3.zoom().on("zoom", zoomed);
        
        // Y軸の設定・・d3のscaleLinear
        var y = d3.scaleLinear().range([height, 0]);
        
        var yInit, yPercentInit, zoomableInit;
        
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

        // X軸のラベル設定(ラベルを軸の下側、4つごと)
        var xAxis = d3.axisBottom(x).ticks(4);

        // Y軸のラベル設定(ラベルを軸の左側、4つごと)
        var yAxis = d3.axisLeft(y).ticks(4);
        
        // SVGの作成
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // 表題
        svg.append('text')
            .attr("class", "symbol")
            .attr("x", 5)
            .text(name + " (" + symbol + ")");
    
        // ビュー指定
        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", y(1))
            .attr("width", width)
            .attr("height", y(0) - y(1));

        // ビューにローソク足を指定
        svg.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#clip)");

        // ビューに移動平均を指定
        svg.append("g")
            .attr("class", "indicator sma ma-0")
            .attr("clip-path", "url(#clip)");

        // ビューに移動平均を指定
        svg.append("g")
            .attr("class", "indicator sma ma-1")
            .attr("clip-path", "url(#clip)");

        // ビューに移動平均を指定
        svg.append("g")
        .attr("class", "indicator sma ma-2")
        .attr("clip-path", "url(#clip)");

        // X軸の位置
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");

        // Y軸の位置
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(0, 0)");

        // ズーム枠の指定
        svg.append("rect")
            .attr("class", "pane")
            .attr("width", width)
            .attr("height", height)
            .call(zoom);

        // データ読み込み
        d3.json(dataset, (error, data) => {
                var accessor = candlestick.accessor(),
                indicatorPreRoll = 0;  // indicatorsが表示できない範囲をオフセット
                data = data.map( (d) => {
                        return {
                                date: parseDate(d.Date),
                                open: +d.Open,
                                high: +d.High,
                                low: +d.Low,
                                close: +d.Close,
                                volume: +d.Volume
                        };
        }).sort((a, b) => {
                return d3.ascending(accessor.d(a), accessor.d(b));
        });

        // techanのX軸＝時間軸を指定
        x.domain(techan.scale.plot.time(data, accessor).domain());
        // techanのY軸＝ohlcを指定
        y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll), accessor).domain());

        // データのバインド
        svg.select("g.candlestick").datum(data).call(candlestick);
        ma.forEach((v, i) => {
            var el = "g.sma.ma-" + i;
            svg.select(el).datum(techan.indicator.sma().period(ma[i])(data)).call(sma[i]);            
        });
        zoomableInit = x.zoomable().domain([indicatorPreRoll, data.length]).copy(); // indicatorPreRoll-データの範囲でズーム
        yInit = y.copy();

        draw();
    });

    function reset() {
        zoom.scale(1);
        zoom.translate([0, 0]);
        draw();
    }

    function zoomed() {
        x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
        y.domain(d3.event.transform.rescaleY(yInit).domain());

        draw();
    }

    function draw() {
        svg.select("g.x.axis").call(xAxis);
        svg.select("g.y.axis").call(yAxis);

        svg.select("g.candlestick").call(candlestick.refresh);
        ma.forEach((v, i) => {
            var el = "g.sma.ma-" + i;
            svg.select(el).call(sma[i].refresh);            
        });
    }
}

chart("Facebook, Inc.", "FB", "data.json", [25,50,75], 600, 400);
chart("Google, Inc.", "GOOG", "data.json", [25,50,75], 600, 400);
chart("Apple, Inc.", "AAPL", "data.json", [25,50,75], 600, 400);