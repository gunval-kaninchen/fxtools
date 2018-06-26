const d3 = require('d3');
const jsdom = require('jsdom');
const techan = require('techan');

const { JSDOM } = jsdom;
const document = new JSDOM().window.document;

var margin = {top: 20, right: 20, bottom: 30, left: 50},
width = 960 - margin.left - margin.right,
height = 500 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L%Z");

var x = techan.scale.financetime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var candlestick = techan.plot.candlestick()
.xScale(x)
.yScale(y);

var xAxis = d3.axisBottom().scale(x);
var yAxis = d3.axisLeft().scale(y);

var svg = d3.select(document.body).append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("file:///Data/repo/kaninchen/test/data.json", (error, data) => {
    var accessor = candlestick.accessor();
    
    data = data.slice(0, 200).map((d) => {
        return {
            date: parseDate(d.date),
            open: +d.open,
            high: +d.high,
            low: +d.low,
            close: +d.close
        };
    }).sort((a, b) => {
        return d3.ascending(accessor.d(a), accessor.d(b));
    });

svg.append("g")
    .attr("class", "candlestick");

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")");

svg.append("g")
    .attr("class", "y axis")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Price ($)");

draw(data.slice(0, data.length-20));

console.log(document.body.innerHTML);
});

function draw(data) {
        x.domain(data.map(candlestick.accessor().d));
        y.domain(techan.scale.plot.ohlc(data, candlestick.accessor()).domain());
        svg.selectAll("g.candlestick").datum(data).call(candlestick);
        svg.selectAll("g.x.axis").call(xAxis);
        svg.selectAll("g.y.axis").call(yAxis);
}

