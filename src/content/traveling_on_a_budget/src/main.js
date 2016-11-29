
// use dispatch.on("load.namespace", function (data) { ... }); to use the data from budget.csv
var dispatch = d3.dispatch("loaded"),
    twoDecimalRound = d3.format("$,.2f");

document.addEventListener("DOMContentLoaded", function () {
    d3.json("data/places.json", function (error, data) {
        // aggregate amount spent and num days by country
        var budgetPerCountry = d3.nest()
            .key(function(d) { return d.country; })
            .rollup(function (v) {
                var days = d3.sum(v, function (d) { return d.value.days; });
                var amount = d3.sum(v, function (d) { return d.value.amount; });
                return {
                    days: days,
                    amount: amount,
                    averageDailySpent: amount / days,
                };
            })
            .entries(data.places);

        var countryColors = data.countries.reduce(
            function (previousValue, currentValue, currentIndex, array) {
                previousValue[currentValue.name] = d3.schemeCategory20[currentIndex];
                return previousValue;
            }, {});

        var newData = {
            budgetPerCountry: budgetPerCountry,
            places: data.places,
            countryColors: countryColors
        };

        dispatch.call("loaded", this, newData);
    });
});

//dispatch.on("loaded.budgetByCountry", function (data) {
//    var barChart = graphComponents.barChart()
//        .x(function (d) { return d.key; })
//        .y(function (d) { return d.value.averageDailySpent; })
//        .yTickFormat(d3.format("$,"))
//        .yLabel('Average Daily Spending')
//        .color(function (d) { return data.countryColors[d.key]; })
//        .hoverText(function (d) { return twoDecimalRound(d.value.averageDailySpent); })
//        .key(null);
//
//    d3.select('#budgetByCountry')
//        .datum(data.budgetPerCountry)
//        .call(barChart);
//});

dispatch.on("loaded.budgetByPlace", function (data) {
    var rScale = d3.scaleLinear()
        .domain(d3.extent(data.places, function (d) { return d.value.days; }))
        .range([5, 15]);

    var scatterplotPlaces = graphComponents.scatterplot()
        .x(function (d) { return new Date(d.midDate); })
        .y(function (d) { return d.value.amount / d.value.days; })
        .r(function (d) { return rScale(d.value.days); })
        .xScaleGenerator(function (data, width, height) {
            return d3.scaleTime()
                .domain(d3.extent(data, function (d) { return new Date(d.midDate); }))
                .range([0, width])
                .nice(); })
        .xTickFormat(d3.timeFormat("%b '%y"))
        .yTickFormat(d3.format("$,"))
        .yLabel('Average Daily Spending')
        .color(function (d) { return data.countryColors[d.country]; })
        .hoverText(function (d) { return d.name;});

    d3.select('#spendingPerPlace')
        .datum(data.places)
        .call(scatterplotPlaces);

    d3.selectAll('#spendingPerPlace .xAxis g text')
        .attr("transform", "rotate(30)")
        .attr("x", 3)
        .style("text-anchor", "start");

    var scatterplot1 = graphComponents.scatterplot()
        .x(function (d) { return d.value.days; })
        .y(function (d) { return d.value.amount / d.value.days; })
        .r(function (d) { return rScale(d.value.days); })
        .xScaleGenerator(function (data, width, height) {
            return d3.scaleLinear()
                .domain([0, d3.max(data, function (d) { return d.value.days; })])
                .range([0, width]); })
        .yTickFormat(d3.format("$,"))
        .xLabel('Length of Stay (days)')
        .yLabel('Average Daily Spending')
        .color(function (d) { return data.countryColors[d.country]; })
        .hoverText(function (d) { return d.name;});

    d3.select('#avgVsLength')
        .datum(data.places)
        .call(scatterplot1);
});
