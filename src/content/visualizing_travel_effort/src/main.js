function daysElapsed (start, end) {
    return Math.floor((end - start) / (1000*60*60*24));
}

var dispatch = d3.dispatch("loaded"),
    alternateCountryNames = {
        'CostaRica': 'Costa Rica'
    };

var countryColors = countries.reduce(function (previousValue, currentValue, currentIndex, array) {
    previousValue[currentValue.name] = d3.schemeCategory20[currentIndex];
    return previousValue;
}, {});

var countryColorsKey = countries.map(function (country) {
    return graphComponents.colorRow()
               .text(country.name)
               .color(countryColors[country.name]);
});

// calculate length of stay in each country
countries.forEach(function (country) {
    country.startAndEnds.forEach(function (dates) {
        dates.start = new Date(dates.start);
        dates.end = new Date(dates.end);
        dates.daysElapsed = daysElapsed(dates.start, dates.end);
    });

    var totalDays = country.startAndEnds.reduce(function (prev, curr) {
        return prev + curr.daysElapsed;
    }, 0);

    country.days = totalDays;
});

// total length (remember to add an extra day to the last place)
var totalDays = countries.reduce(function (prev, curr) {
    return prev + curr.days;
}, 0);

// update places to have a country tag
var re = /#(\w+)_/;
PLACES.forEach(function (place) {
    place.country = re.exec(place.id)[1];

    if (alternateCountryNames.hasOwnProperty(place.country)) {
        place.country = alternateCountryNames[place.country];
    }

    var endDate = new Date(place.endDate),
        startDate = new Date(place.startDate);

    place.days = daysElapsed(startDate, endDate);
    place.midDate = new Date(((endDate - startDate) / 2) + startDate.getTime());
});

document.addEventListener("DOMContentLoaded", function () {
    var lengthOfStay = graphComponents.barChart()
        .x(function (d) { return d.name; })
        .y(function (d) { return d.days; })
        .yLabel('Length Of Stay (days)')
        .color(function (d) { return countryColors[d.name]; })
        .hoverText(function (d) { return d.days + ' days'; })
        .key(null);

    d3.select('#lengthOfStay')
        .datum(countries)
        .call(lengthOfStay);

    var lengthOfStayPerPlace = graphComponents.barChart()
        .x(function (d) { return d.id; })
        .y(function (d) { return d.days; })
        .xLabel('Places Stayed')
        .yLabel('Length Of Stay (days)')
        .color(function (d) { return countryColors[d.country]; })
        .hoverText(function (d) { return d.name; });

    d3.select('#lengthOfStayPerPlace')
        .datum(PLACES)
        .call(lengthOfStayPerPlace);

    var travelTimePerPlace = graphComponents.barChart()
        .x(function (d) { return d.id; })
        .y(function (d) { return d.travelTime; })
        .xLabel('Places Stayed')
        .yLabel('Travel Time to reach destination (hours)')
        .color(function (d) { return countryColors[d.country]; })
        .hoverText(function (d) { return d.name; });

    d3.select('#travelTimePerPlace')
        .datum(PLACES)
        .call(travelTimePerPlace);

    var travelTimePerPlaceScatterplot = graphComponents.scatterplot()
        .x(function (d) { return new Date(d.midDate); })
        .y(function (d) { return d.travelTime; })
        .r(function (d) { return 5; })
        .xScaleGenerator(function (data, width, height) {
            return d3.scaleTime()
                .domain(d3.extent(data, function (d) { return new Date(d.midDate); }))
                .range([0, width])
                .nice(); })
        .xTickFormat(d3.timeFormat("%b '%y"))
        .xLabel('Date Visited')
        .yLabel('Travel Time to reach destination (hours)')
        .color(function (d) { return countryColors[d.country]; })
        .hoverText(function (d) { return d.name;});

    d3.select('#travelTimePerPlaceScatterplot')
        .datum(PLACES)
        .call(travelTimePerPlaceScatterplot);

    // medellín selection
    var medellinSelection = d3.selectAll('#travelTimePerPlaceScatterplot .chart g')
        .filter(function (d) { return d.name === 'Medellín'; });

    d3.select('#medellínMouse').on('mouseenter', function (d, i) {
        medellinSelection.classed('highlight', true);
    });

    d3.select('#medellínMouse').on('mouseleave', function (d, i) {
        medellinSelection.classed('highlight', false);
    });

    var travelSpeed = function (d) { return (d.travelTime / 24) / d.days; };

    var travelTimeOverTotalTimePoints = graphComponents.scatterplot()
        .x(function (d) { return new Date(d.midDate); })
        .y(travelSpeed)
        .r(function (d) { return 5; })
        .xScaleGenerator(function (data, width, height) {
            return d3.scaleTime()
                .domain(d3.extent(data, function (d) { return new Date(d.midDate); }))
                .range([0, width])
                .nice(); })
        .xTickFormat(d3.timeFormat("%b '%y"))
        .yTickFormat(d3.format('.0%'))
        .xLabel('Date Visited')
        .yLabel('Travel Time / Time Spent (%)')
        .color(function (d) { return countryColors[d.country]; })
        .hoverText(function (d) { return d.name;});

    d3.select('#travelTimeOverTotalTimePoints')
        .datum(PLACES)
        .call(travelTimeOverTotalTimePoints);

    var travelTimeOverTotalTimeLine = graphComponents.scatterplot()
        .x(function (d) { return new Date(d.midDate); })
        .y(travelSpeed)
        .r(function (d) { return 5; })
        .xScaleGenerator(function (data, width, height) {
            return d3.scaleTime()
                .domain(d3.extent(data, function (d) { return new Date(d.midDate); }))
                .range([0, width])
                .nice(); })
        .xTickFormat(d3.timeFormat("%b '%y"))
        .yTickFormat(d3.format('.0%'))
        .xLabel('Date Visited')
        .yLabel('Travel Time / Time Spent (%)')
        .color(function (d) { return countryColors[d.country]; })
        .startingState(function (keyRows) {
            var pointsRow = keyRows[0],
                lineRow = keyRows[1];

            // set the points to invisible and line to visible
            pointsRow.clickFunction()(false);
            lineRow.clickFunction()(true);

            pointsRow.checked(false);
            lineRow.checked(true);

            return keyRows; })
        .hoverText(function (d) { return d.name; });

    d3.select('#travelTimeOverTotalTimeLine')
        .datum(PLACES)
        .call(travelTimeOverTotalTimeLine);

    // highlight selections
    var placeNumber = /#(\w+)_(\d+)/;
    var patagonianSelection = d3.selectAll('#travelTimeOverTotalTimePoints .chart .point')
        .filter(function (d) {
            var countryNumber = placeNumber.exec(d.id);
            return (countryNumber[1] === 'Chile' && countryNumber[2] >= 10 && countryNumber[2] <= 19) ||
                   (countryNumber[1] === 'Argentina' && countryNumber[2] >= 1 && countryNumber[2] <= 3);
        });

    d3.selectAll('.patagoniaMouse')
        .on('mouseenter', function (d, i) {
            patagonianSelection.classed('highlight', true); })
        .on('mouseleave', function (d, i) {
            patagonianSelection.classed('highlight', false); });

    var boliviaSelection = d3.selectAll('#travelTimeOverTotalTimePoints .chart .point')
        .filter(function (d) { return d.country === 'Bolivia'; });

    d3.select('#boliviaMouse')
        .on('mouseenter', function (d, i) {
            boliviaSelection.classed('highlight', true); })
        .on('mouseleave', function (d, i) {
            boliviaSelection.classed('highlight', false); });

    var colombiaSelection = d3.selectAll('#travelTimeOverTotalTimePoints .chart .point')
        .filter(function (d) { return d.country === 'Colombia'; });

    d3.select('#colombiaMouse')
        .on('mouseenter', function (d, i) {
            colombiaSelection.classed('highlight', true); })
        .on('mouseleave', function (d, i) {
            colombiaSelection.classed('highlight', false); });

    // Relative Travel Effort by Country
    var countries2 = d3.nest()
        .key(function (d) { return d.country; })
        .rollup(function (v, i) { return {
            totalTravelTime: d3.sum(v, function (d) { return d.travelTime; }),
        }; })
        .entries(PLACES);

    countries2.forEach(function (country, index) {
        country.days = countries[index].days;
        country.avgTravelSpeed = (country.value.totalTravelTime / 24) / country.days;
    });

    var travelSpeedCountry = graphComponents.barChart()
        .x(function (d) { return d.key; })
        .y(function (d) { return d.avgTravelSpeed; })
        .yTickFormat(d3.format('.0%'))
        .yLabel('Travel Time / Time Spent (%)')
        .color(function (d) { return countryColors[d.key]; })
        .hoverText(function (d) { return d3.format(".1%")(d.avgTravelSpeed); })
        .key(null);

    d3.select('#travelSpeedCountry')
        .datum(countries2)
        .call(travelSpeedCountry);

    // style and set text
    // color code country text by color
    countries.forEach(function (country) {
        d3.selectAll('span.' + country.id).style('color', countryColors[country.name]);
    });

    var total = d3.nest()
        .rollup(function (v) { return {
            travelTime: d3.sum(v, function (d) { return d.travelTime; }),
        }; })
        .entries(PLACES);

    // set total travel time data in conclusions
    d3.select('#totalDays').text(totalDays);
    d3.select('#totalTravelTime').text(d3.format(".0f")(total.travelTime));
    d3.select('#commuteTime').text(d3.format(".2f")(total.travelTime / 5 / 48));
});
