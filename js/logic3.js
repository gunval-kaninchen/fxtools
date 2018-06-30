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

var indicatorTop = d3.scaleLinear()
        .range([dim.indicator.top, dim.indicator.bottom]);

var parseDate = d3.timeParse("%d-%b-%y");

var zoom = d3.zoom().on("zoom", zoomed);

var x = techan.scale.financetime().range([0, dim.plot.width]);

var y = d3.scaleLinear().range([dim.ohlc.height, 0]);

var yInit, zoomableInit;

var candlestick = techan.plot.candlestick()
        .xScale(x)
        .yScale(y);

var sma0 = techan.plot.sma()
        .xScale(x)
        .yScale(y);

var sma1 = techan.plot.sma()
        .xScale(x)
        .yScale(y);

var ema2 = techan.plot.ema()
        .xScale(x)
        .yScale(y);

var trendline = techan.plot.trendline()
        .xScale(x)
        .yScale(y);

var xAxis = d3.axisBottom(x);

var timeAnnotation = techan.plot.axisannotation()
        .axis(xAxis)
        .orient('bottom')
        .format(d3.timeFormat('%Y-%m-%d'))
        .width(65)
        .translate([0, dim.plot.height]);

var yAxis = d3.axisRight(y);

var ohlcAnnotation = techan.plot.axisannotation()
        .axis(yAxis)
        .orient('right')
        .format(d3.format(',.2f'))
        .translate([x(1), 0]);

var closeAnnotation = techan.plot.axisannotation()
        .axis(yAxis)
        .orient('right')
        .accessor(candlestick.accessor())
        .format(d3.format(',.2f'))
        .translate([x(1), 0]);

var macdScale = d3.scaleLinear()
        .range([indicatorTop(0)+dim.indicator.height, indicatorTop(0)]);

var macd = techan.plot.macd()
        .xScale(x)
        .yScale(macdScale);

var macdAxis = d3.axisRight(macdScale)
        .ticks(3);

var macdAnnotation = techan.plot.axisannotation()
        .axis(macdAxis)
        .orient("right")
        .format(d3.format(',.2f'))
        .translate([x(1), 0]);

var macdAxisLeft = d3.axisLeft(macdScale)
        .ticks(3);

var macdAnnotationLeft = techan.plot.axisannotation()
        .axis(macdAxisLeft)
        .orient("left")
        .format(d3.format(',.2f'));

var ohlcCrosshair = techan.plot.crosshair()
        .xScale(timeAnnotation.axis().scale())
        .yScale(ohlcAnnotation.axis().scale())
        .xAnnotation(timeAnnotation)
        .yAnnotation([ohlcAnnotation])
        .verticalWireRange([0, dim.plot.height]);

var macdCrosshair = techan.plot.crosshair()
        .xScale(timeAnnotation.axis().scale())
        .yScale(macdAnnotation.axis().scale())
        .xAnnotation(timeAnnotation)
        .yAnnotation([macdAnnotation, macdAnnotationLeft])
        .verticalWireRange([0, dim.plot.height]);

var svg = d3.select("body").append("svg")
        .attr("width", dim.width)
        .attr("height", dim.height);

var defs = svg.append("defs");

defs.append("clipPath")
        .attr("id", "ohlcClip")
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", dim.plot.width)
        .attr("height", dim.ohlc.height);

defs.selectAll("indicatorClip").data([0, 1])
        .enter()
        .append("clipPath")
        .attr("id", function(d, i) { return "indicatorClip-" + i; })
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d, i) { return indicatorTop(i); })
        .attr("width", dim.plot.width)
        .attr("height", dim.indicator.height);

svg = svg.append("g")
        .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

svg.append('text')
        .attr("class", "symbol")
        .attr("x", 20)
        .text("Facebook, Inc. (FB)");

svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + dim.plot.height + ")");

var ohlcSelection = svg.append("g")
        .attr("class", "ohlc")
        .attr("transform", "translate(0,0)");

ohlcSelection.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + x(1) + ",0)")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -12)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Price ($)");

ohlcSelection.append("g")
        .attr("class", "close annotation up");

ohlcSelection.append("g")
        .attr("class", "candlestick")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "indicator sma ma-0")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "indicator sma ma-1")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "indicator ema ma-2")
        .attr("clip-path", "url(#ohlcClip)");

ohlcSelection.append("g")
        .attr("class", "percent axis");

var indicatorSelection = svg.selectAll("svg > g.indicator").data(["macd"]).enter()
        .append("g")
        .attr("class", function(d) { return d + " indicator"; });

indicatorSelection.append("g")
        .attr("class", "axis right")
        .attr("transform", "translate(" + x(1) + ",0)");

indicatorSelection.append("g")
        .attr("class", "axis left")
        .attr("transform", "translate(" + x(0) + ",0)");

indicatorSelection.append("g")
        .attr("class", "indicator-plot")
        .attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; });

// Add trendlines and other interactions last to be above zoom pane
svg.append('g')
        .attr("class", "crosshair ohlc");

svg.append('g')
        .attr("class", "crosshair macd");

svg.append("g")
        .attr("class", "trendlines analysis")
        .attr("clip-path", "url(#ohlcClip)");

//d3.select("button").on("click", reset);

d3.csv("data.csv", function(error, data) {
    var accessor = candlestick.accessor(),
        indicatorPreRoll = 33;  // Don't show where indicators don't have data

    data = data.map(function(d) {
        return {
            date: parseDate(d.Date),
            open: +d.Open,
            high: +d.High,
            low: +d.Low,
            close: +d.Close,
        };
    }).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });

    x.domain(techan.scale.plot.time(data).domain());
    y.domain(techan.scale.plot.ohlc(data.slice(indicatorPreRoll)).domain());

    var trendlineData = [
        { start: { date: new Date(2014, 2, 11), value: 72.50 }, end: { date: new Date(2014, 5, 9), value: 63.34 } },
        { start: { date: new Date(2013, 10, 21), value: 43 }, end: { date: new Date(2014, 2, 17), value: 70.50 } }
    ];

    var macdData = techan.indicator.macd()(data);
    macdScale.domain(techan.scale.plot.macd(macdData).domain());

    svg.select("g.candlestick").datum(data).call(candlestick);
    svg.select("g.close.annotation").datum([data[data.length-1]]).call(closeAnnotation);
    svg.select("g.sma.ma-0").datum(techan.indicator.sma().period(10)(data)).call(sma0);
    svg.select("g.sma.ma-1").datum(techan.indicator.sma().period(20)(data)).call(sma1);
    svg.select("g.ema.ma-2").datum(techan.indicator.ema().period(50)(data)).call(ema2);
    svg.select("g.macd .indicator-plot").datum(macdData).call(macd);

    svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
    svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
    svg.select("g.trendlines").datum(trendlineData).call(trendline).call(trendline.drag);

    // Stash for zooming
    zoomableInit = x.zoomable().domain([indicatorPreRoll, data.length]).copy(); // Zoom in a little to hide indicator preroll
    yInit = y.copy();

    draw();
});

function reset() {
    zoom.scale(1);
    zoom.translate([0,0]);
    draw();
}

function zoomed() {
    x.zoomable().domain(d3.event.transform.rescaleX(zoomableInit).domain());
    y.domain(d3.event.transform.rescaleY(yInit).domain());

    draw();
}

function draw() {
    svg.select("g.x.axis").call(xAxis);
    svg.select("g.ohlc .axis").call(yAxis);
    svg.select("g.macd .axis.right").call(macdAxis);
    svg.select("g.macd .axis.left").call(macdAxisLeft);

    // We know the data does not change, a simple refresh that does not perform data joins will suffice.
    svg.select("g.candlestick").call(candlestick.refresh);
    svg.select("g.close.annotation").call(closeAnnotation.refresh);
    svg.select("g .sma.ma-0").call(sma0.refresh);
    svg.select("g .sma.ma-1").call(sma1.refresh);
    svg.select("g .ema.ma-2").call(ema2.refresh);
    svg.select("g.macd .indicator-plot").call(macd.refresh);
    svg.select("g.crosshair.ohlc").call(ohlcCrosshair.refresh);
    svg.select("g.crosshair.macd").call(macdCrosshair.refresh);
    svg.select("g.trendlines").call(trendline.refresh);
}