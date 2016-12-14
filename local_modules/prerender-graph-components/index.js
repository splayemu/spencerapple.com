// global variable so clientside scripts can use as well
const graphs = require('./graphs');
const keyComponents = require('./keyComponents');

prerenderGraphComponents = module.exports = {
    'barChart': graphs.barChart,
    'scatterplot': graphs.scatterplot,
    'lineChart': graphs.lineChart,
    'key': keyComponents.key,
    'colorRow': keyComponents.colorRow,
    'checkBoxRow': keyComponents.checkBoxRow
}

