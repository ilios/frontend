import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, scaleBand, scaleLinear, schemeCategory10 } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { stack } from 'd3-shape';

const { Component, run, get } = Ember;

export default Component.extend({
  tagName: 'svg',
  classNames: ['chart-bar-stacked'],
  attributeBindings: ['width', 'height'],
  didReceiveAttrs() {
    // Anytime we get an update schedule a draw
    run.scheduleOnce('render', this, this.draw);
  },
  data: null,
  width: null,
  height: null,
  draw(){
    const data = get(this, 'data') || [];
    const svg = select(this.element);
    const margin = {top: 0, right: 20, bottom: 40, left: 20};
    const chartWidth = get(this, 'width') - margin.left - margin.right;
    const chartHeight = get(this, 'height') - margin.top - margin.bottom;
    const color = scaleOrdinal(schemeCategory10);

    const x = scaleBand().range([0, chartWidth]).padding(0.4);
    const y = scaleLinear().range([chartHeight, 0]);
    const z = scaleOrdinal(schemeCategory10);

    var keys_set = {};
    var keys_list = [];

    let reformattedData = data.map((d) => {
      let obj = {label: d.label, total: d.total};
      d.values.forEach((value, index) => {
        var value_key = value.label + '-' + index;
        obj[value_key] = value.value;
        if (!keys_set[value_key]) {
          keys_set[value_key] = 1;
          keys_list.push(value_key);
        }
      });
      return obj;
    }).map((d) => {
      keys_list.forEach((key) => {
        d[key] = d[key] || 0;
      });
      return d;
    });

    const dataOrArray = reformattedData?reformattedData:[];

    x.domain(dataOrArray.map(d => d.label));
    y.domain([0, max(dataOrArray, d => d.total)]);
    z.domain(keys_list);

    svg.append('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")");

    svg.selectAll('.bar')
      .data(stack().keys(keys_list)(dataOrArray))
      .enter().append("g")
      .attr("class", "bar")
      .attr("fill", function(d) { return z(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
      .attr("x", function(d) { return x(d.data.label); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) {return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth());

    svg.append("g").attr("transform", "translate(0," + chartHeight + ")").call(axisBottom(x))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(75)")
      .style("text-anchor", "start");

    svg.append("g").call(axisLeft(y).ticks(10))
      .selectAll("text")
      .attr("x", 4)
      .attr("y", y(y.ticks(10).pop()) + 0.5)
      .attr("dy", "0.35em")
      .attr("text-anchor", "start")
      .attr("fill", "#000");

      },
});
