---
title: Visualizing our yearlong budget through Latin America
author: Spencer Apple
layout: post.pug
withImage: budgetVis.png
publishDate: 2016-09-20 15:00
modifyDate: 2016-11-29 15:00
---

After working for two years post graduating, my girlfriend and I quit our jobs and bought one way tickets to Lima, Peru.
We made our way around South America and up Central America back to California.
Managing our budget was an everyday activity, and it inspired me to break it down further with different visualizations.

<span class="more"><span>

<link rel="stylesheet" href="css/main.css"></link>
<script type="text/javascript" src="lib/d3.min.js"></script>
<script type="text/javascript" src="src/graphComponents.js"></script>
<script type="text/javascript" src="src/main.js"></script>

Overall we traveled for **<span id="totalDays"></span> days**, spent **<span id="totalSpent"></span>** and ended spending **<span id="averageDailySpent"></span> per day** between the two of us.

We tracked our day to day spending in Google Docs and averaged it by the number of days to keep track of our Average Daily Spending. We also calculated an Average Daily Spending for each country. 

My girlfriend Lauren is learning to program with a focus on geography; she has been making an 
<a href="http://laurenmackey.com/route-map/" target="_blank">interactive route map</a> of our trip.
She created a list of places with start and end dates which I used to aggregate our spending by place and by country.

---
## Average Daily Spending per Country
<div id="budgetByCountry"></div>

We started out with a heavy budget; drinking, eating, and going on lots of tours. 
Then we mellowed out and spent less in Bolivia. 
Then by Chile we were in super budget mode. 
We realized that without a return date, the less we spent, the longer we could travel.

Determined to extend our trip up to a year, we volunteered in Southern Chile for a month on a dairy farm.
There we recieved room and board in exchange for working 5 hours a day.
Farther South through Chile and into Patagonia, we started camping and hitchhiking as we had heard Patagonia was exorbitantly expensive.

After Patagonia, through Argentina and Colombia, we were able to keep a fairly low budget, but over time our vigilance mellowed out. 
Going through Central America, we pretty much failed being budgety for several reasons. 
The trip was winding down, we were lazy, and the tropical beach vibe was too hard to resist.

---
## Average Daily Spending per Place
Here you can see our Average Daily Spending on the Y Axis, when we visited on the X Axis, and our length of stay via the size of the circle.
<div id="spendingPerPlace"></div>

---
## Average Daily Spending over Length of Stay
The same places now plotted with respect to the length of time we stayed.

The circles in the top left show our highest cost excursions, which include flights, expensive food and accommodation, staying in an ecolodge in the Amazon, and our sailing trip through the San Blas Islands.

In the bottom left corner, you will find many towns in the Chilean Patagonia when we were hitchhiking and camping.
<div id="avgVsLength"></div>

---
## The Code

The following code snipets are in full <a href="https://gitlab.com/splayemu/splayemu.gitlab.io/blob/master/contents/articles/traveling_on_a_budget/src/visualization.js#L337" target="_blank">here</a>.

Following Mike Bostocks <a href="https://bost.ocks.org/mike/chart/" target="_blank">Towards Reusable Charts</a>, I wanted to create an easy to use and reusable component to generate graphs in my data visualizations. 
Here is a cut down version of my base component.
Notice that the actual d3 scales are created here and are used to create the axices, then are passed to the plot callback in order to help render the graphs. 

```javascript
// chartWithAxices creates an svg chart with the x and y axices
graphComponents.chartWithAxices = function () {
    // local variables that can be retrieved and set with functions
    var svgComponent = graphComponents.svg(),
        xScaleGenerator = function (data, width, height) {
            graphComponents.assert(false, "xScaleGenerator:: not defined");
        },
        yScaleGenerator = function (data, width, height) {
            graphComponents.assert(false, "yScaleGenerator:: not defined");
        },
        dispatch = d3.dispatch('plot'),
        ...

    function my (selection) {
        selection.each(function (data, i) {
            var svg = svgComponent(d3.select(this)),
                gComponent = svg
                    .append('g');

            var yScale = yScaleGenerator(data, width, height),
                xScale = xScaleGenerator(data, width, height);

            var xAxis = d3.axisBottom()
                .scale(xScale);

            var yAxis = d3.axisLeft()
                .scale(yScale);

            // renders the axices
            svg.append('g')
                .call(xAxis);

            svg.append('g')
                .call(yAxis);

            // invokes callbacks that render the graph (points, bars, lines)
            dispatch.call("plot", gComponent.node(), data, width, height, xScale, yScale);
        });
    }
    // getters and setters (method chaining style) go here

    return my;
};
```

Now to expand on the base chartWithAxices, we can use it to make a reusable barChart component.

```javascript
graphComponents.barChart = function () {
    var chartWithAxices = graphComponents.chartWithAxices(),
        barPadding = 0.05,
        x = function (d) { return d; },
        y = function (d) { return d; },
        // default barChart scales that can be overwritten
        xScaleGenerator = function (data, width, height) {
            return d3.scaleBand()
                .domain(data.map(function (d) { return x(d); }))
                .range([0, width])
                .round(true)
                .paddingInner(barPadding); },
        yScaleGenerator = function (data, width, height) {
            return d3.scaleLinear()
                .domain([0, d3.max(data, function (d) { return y(d); })].reverse())
                .range([0, height])
                .nice(); },
        ...

    function my (selection) {
        chartWithAxices
            .xScaleGenerator(xScaleGenerator)
            .yScaleGenerator(yScaleGenerator)
            // registers a plot callback
            .onPlot('barChart', function (data, width, height, xScale, yScale) {
                var selection = d3.select(this);

                // DATA JOIN
                var outputSelection = selection
                    .selectAll('g')
                    .data(data);

                // ENTER
                var eachOutput = outputSelection
                    .enter().append('g');

                eachOutput
                    .append('rect')
                    .classed('outputRect', true)
                    .attr('width', xScale.bandwidth());

                // ENTER + UPDATE
                d3.select(this).selectAll('g')
                    .attr('transform', function (d, i) {
                        return "translate(" + xScale(x(d)) + "," + yScale(y(d)) + ")"; })
                    .call(drawText);

                selection.selectAll('rect')
                    .attr('height', function (d) { return height - yScale(y(d)); });

                // EXIT
                outputSelection
                    .exit().remove(); });

        selection.each(function (data, i) {
            d3.select(this)
                .attr("class", "barChart")
                .call(chartWithAxices);
        });
    }
    // getters and setters (method chaining style) go here

    return my;
};
```

Finally, we can see how to use the barChart component to generate the Average Daily Spending per Country graph.

```javascript
var barChart = graphComponents.barChart()
    .x(function (d) { return d.key; })
    .y(function (d) { return d.value.averageDailySpent; })
    .yTickFormat(d3.format("$,"))
    .yLabel('Average Daily Spending')
    .color(function (d) { return countryColors[d.key]; })
    .hoverText(function (d) { return twoDecimalRound(d.value.averageDailySpent); })
    .key(null);

d3.select('#budgetByCountry')
    .datum(data.budgetPerCountry)
    .call(barChart);
```


---
## Conclusions
All in all it was entertaining to make these visuals. 
I spent a lot of time making reusable D3 components which was a challenge in itself.

In the end, the length of our trip was determined by our budget, but how long one travels can also be determined by his or her tiredness, want of routine, and the desire to relax with friends and family.

Check out [Visualizing Travel Effort](/content/visualizing-travel-effort/) to see where we spent the most time traveling.
