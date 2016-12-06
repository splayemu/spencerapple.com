'use strict';

module.exports = function key () {
    const rowHeight = 20;
    const rowPadding = 5;
    let x = 0;
    let y = 0;

    function my (selection) {
        selection.each(function (data, i) {
            var key = d3.select(this)
                .attr('class', 'key')
                .attr("transform", "translate(" + x + ',' + y + ')');

            var row = key
                .selectAll('g')
                .data(data)
                .enter().append('g')
                .attr('transform', function (d, i) {
                    return 'translate(0,' + (i * (rowHeight + rowPadding)) + ')'; })
                .each(function (rowObj, i) {
                    //rowObj.height(rowHeight); not implemented
                    d3.select(this).datum("already encoded").call(rowObj); });
        });
    }

    my.x = function (_) {
        if(!arguments.length) return x;
        x = _;
        return my;
    };

    my.y = function (_) {
        if(!arguments.length) return y;
        y = _;
        return my;
    };

    return my;
}
