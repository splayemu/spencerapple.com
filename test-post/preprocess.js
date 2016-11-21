d3 = require('d3')

module.exports.test = function (window, body, el, id) {
    el.innerHTML = '';

    var circle = d3.select(el)
        .append('svg:svg')
            .attr('width', 600)
            .attr('height', 300)
            .append('circle')
                .attr('cx', 300)
                .attr('cy', 150)
                .attr('r', 10)
                .attr('fill', '#26963c')
                .attr('id', id);
}
