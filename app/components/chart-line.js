import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, scaleBand, scaleLinear, schemeCategory10 } from 'd3-scale';
import { line } from 'd3-shape';
import { min, max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { format } from 'd3-format';

const { Component, run, get } = Ember;

export default Component.extend({
  tagName: 'svg',
  classNames: ['chart-line'],
  attributeBindings: ['width', 'height'],
  didReceiveAttrs() {
    // Anytime we get an update schedule a draw
    run.scheduleOnce('render', this, this.draw);
  },
  data: null,
  width: null,
  height: null,
  draw(){
    const data = get(this, 'data');
    const dataOrArray = data?data:[];
    const svg = select(this.element);
    const margin = {top: 20, right: 20, bottom: 50, left: 70};
    const chartWidth = get(this, 'width') - margin.left - margin.right;
    const chartHeight = get(this, 'height') - margin.top - margin.bottom;

    const x = scaleLinear().range([0, chartWidth]);
    const y = scaleLinear().range([chartHeight, 0]);

    let valueline = line()
      .x(function(d) { return x(d.data); })
      .y(function(d) { return y(Number.parseFloat(d.label)/100); });
      
    x.domain([0, max(dataOrArray, d => d.data + 1)]);
    y.domain([min(dataOrArray, d => Math.floor(Number.parseFloat(d.label)/10))/10, max(dataOrArray, d => Math.ceil(Number.parseFloat(d.label)/10))/10]);

    svg.append("path")
      .data([dataOrArray])
      .attr("class", "line")
      .attr("d", valueline);

    svg.append('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
      .attr("transform", "translate(0," + chartHeight + ")").call(axisBottom(x));

    svg.append("text")
      .attr("transform", "translate(" + (chartWidth/2) + " ," + (chartHeight + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Label");

    svg.append("g").call(axisLeft(y).tickFormat(format(".0%")));

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20 - margin.right)
      .attr("x", 0 - (chartHeight / 8))
      .attr("dy", "1em")
      .style("text-anchor", "start")
      .text("Value");

  },
});
