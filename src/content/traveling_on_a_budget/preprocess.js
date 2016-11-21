d3 = require('d3')
fs = require('fs')
path = require('path')

function parseNumber (numberString) {
    if (numberString === undefined) {
        return null;
    }
    if (! parseInt(numberString[0], 10)) {
        numberString = numberString.substring(1);
    }
    var number = parseFloat(numberString, 10);

    return isNaN(number) ? null : number;
};

function type (d) {
    d.date = new Date(d.date);
    d.amount = parseNumber(d.amount);
    return d;
}

function daysElapsed (start, end) {
    return Math.floor((end - start) / (1000*60*60*24));
}

// define module vars
var twoDecimalRound = d3.format("$,.2f"),
    alternateCountryNames = {
      'CostaRica': 'Costa Rica' },
    data = {
      raw: null,
      byDate: null,
      budgetPerCountry: null,
      totalDays: 0,
      totalAverage: null };

module.exports.asyncLoad = function (htmlContent, filesInDirectory, files) {
  console.log('asyncLoad called', htmlContent.directory);
  budget = new Promise(function (resolve, reject) {
    // read budget file
    var budgetFile = files[path.join(htmlContent.directory, './data/budget.csv')],
        placesFile = files[path.join(htmlContent.directory, './data/places.json')],
        budgetData = d3.csvParse(budgetFile.contents.toString(), type),
        placesData = JSON.parse(placesFile.contents.toString());

    // aggregate amount spent by date
    var byDate = d3.nest()
      .key(function (d) { return d.date; })
      .rollup(function (v) { return {
        amount: d3.sum(v, function (d) { return d.amount; }),
      }; })
      .entries(budgetData);

    data.raw = budgetData;
    data.byDate = byDate;

    var countries = placesData.countries,
        places = placesData.places;

    // calculate length of stay in each country
    placesData.countries.forEach(function (country) {
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

    // update places to have a country tag
    var re = /#(\w+)_/;
    placesData.places = places.map(function (place) {
      place.country = re.exec(place.id)[1];

      if (alternateCountryNames.hasOwnProperty(place.country)) {
          place.country = alternateCountryNames[place.country];
      }

      return place;
    });

    // aggregate amount spent and num days by place
    placesData.places.forEach(function (place) {
        var days = [],
            endDate = new Date(place.endDate),
            startDate = new Date(place.startDate),
            difference = daysElapsed(startDate, endDate);
place.midDate = new Date(((endDate - startDate) / 2) + startDate.getTime());

        byDate.forEach(function (day) {
            if(new Date(day.key) < endDate &&
               new Date(day.key) >= startDate) {
                days.push(day);
            }
        });

        daysNest = d3.nest()
            .rollup(function (v) { return {
                'days': v.length,
                'amount': d3.sum(v, function (d) { return d.value.amount; })
            }; })
            .entries(days);

        // covers empty days that we didn't enter any money for
        if (difference !== daysNest.days) {
            daysNest.days = difference;
        }

        place.days = days;
        place.value = daysNest;
    });

    // aggregate amount spent and num days by country
    data.budgetPerCountry = d3.nest()
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
      .entries(placesData.places);

    // total length (remember to add an extra day to the last place)
    data.totalDays = countries.reduce(function (prev, curr) {
      return prev + curr.days;
    }, 0);

    data.totalAverage = d3.nest()
      .rollup(function (v) {
        var sum = d3.sum(v, function (d) { return d.value.amount; });
        return {
          sum: sum,
          days: data.totalDays,
          averageDailySpent: sum / data.totalDays,
        }; })
      .entries(data.byDate);

    // update json file with processed data
    placesFile.contents = Buffer.from(JSON.stringify(placesData), 'utf-8');

    resolve();
  });

  return budget;
}

module.exports.totalDays = function (querySelector) {
  el = querySelector('#totalDays');
  el.innerHTML = data.totalAverage.days;
}

module.exports.totalSpent = function (querySelector) {
  el = querySelector('#totalSpent');
  el.innerHTML = twoDecimalRound(data.totalAverage.sum);
}

module.exports.averageDailySpent = function (querySelector) {
  el = querySelector('#averageDailySpent');
  el.innerHTML = twoDecimalRound(data.totalAverage.averageDailySpent);
}
