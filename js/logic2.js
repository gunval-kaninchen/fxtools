/*
チャート作成
 
name:　表の名称
symbol:　通貨ペア
fullWidth: 表示幅
fullHeight:　表示高さ
*/
function chart(name, symbol, fullWidth, fullHeight) {
        // マージンの設定    
        var margin = {top: 20, right: 30, bottom: 30, left: 30},
            width = fullWidth - margin.left - margin.right,
            height = fullHeight - margin.top - margin.bottom,
            volumeHeight = fullHeight*.25;
        
        // 日付フォーマット
        var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L%Z");
        
        // X軸の設定・・techan 取引時間軸の設定（時間枠をWidthに合わせる）
        var x = techan.scale.financetime().range([0, width]);

        // ズーム機能On
        var zoom = d3.zoom().on("zoom", zoomed);
        
        // Y軸の設定・・d3のscaleLinear
        var y = d3.scaleLinear().range([height, 0]);

        // 不要？　Y軸パーセント？
        // この段階でyと同じですが、後で別のドメインを取得します
        var yPercent = y.copy(); 
        
        // 不要？　ボリュームのY軸？
        var yVolume = d3.scaleLinear().range([height, height - volumeHeight]);
        
        var yInit, yPercentInit, zoomableInit;
        
        // ローソク足の設定(軸の設定)
        var candlestick = techan.plot.candlestick()
            .xScale(x)
            .yScale(y);
        // 単純移動平均の設定（軸の設定）
        var sma0 = techan.plot.sma()
            .xScale(x)
            .yScale(y);

        // 単純移動平均の設定（軸の設定）
        var sma1 = techan.plot.sma()
            .xScale(x)
            .yScale(y);
            
        // ？
        var xAxis = d3.axisBottom(x).ticks(4);

        // ？
        var yAxis = d3.axisRight(y).ticks(4);
        
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
    
        // ？
        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("x", 0)
            .attr("y", y(1))
            .attr("width", width)
            .attr("height", y(0) - y(1));

        // ？
        svg.append("g")
            .attr("class", "candlestick")
            .attr("clip-path", "url(#clip)");

        // ？
        svg.append("g")
            .attr("class", "indicator sma ma-0")
            .attr("clip-path", "url(#clip)");

        // ？
        svg.append("g")
            .attr("class", "indicator sma ma-1")
            .attr("clip-path", "url(#clip)");

        // ？
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")");

        // ？
        svg.append("g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + width + ",0)");

        // ？
        svg.append("rect")
            .attr("class", "pane")
            .attr("width", width)
            .attr("height", height)
            .call(zoom);

        // データ読み込み
        d3.json("data.json", (error, data) => {
                var accessor = candlestick.accessor(),
                indicatorPreRoll = 33;  // Don't show where indicators don't have data
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

        x.domain(techan.scale.plot.time(data, accessor).domain());
        y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll), accessor).domain());
        yPercent.domain(techan.scale.plot.percent(y, accessor(data[indicatorPreRoll])).domain());
        yVolume.domain(techan.scale.plot.volume(data, accessor.v).domain());

        svg.select("g.candlestick").datum(data).call(candlestick);
        svg.select("g.sma.ma-0").datum(techan.indicator.sma().period(10)(data)).call(sma0);
        svg.select("g.sma.ma-1").datum(techan.indicator.sma().period(20)(data)).call(sma1);

        zoomableInit = x.zoomable().domain([indicatorPreRoll, data.length]).copy(); // Zoom in a little to hide indicator preroll
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

        // We know the data does not change, a simple refresh that does not perform data joins will suffice.
        svg.select("g.candlestick").call(candlestick.refresh);
        svg.select("g.sma.ma-0").call(sma0.refresh);
        svg.select("g.sma.ma-1").call(sma1.refresh);
    }
}

chart("Facebook, Inc.", "FB", 600, 400);
chart("Google, Inc.", "GOOG", 600, 400);
chart("Apple, Inc.", "AAPL", 600, 400);