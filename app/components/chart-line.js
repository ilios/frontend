import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
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
    const dataOrArray = data?data:[{data: 1, label: '', empty: true}];
    const svg = select(this.element);
    const margin = {top: 20, right: 20, bottom: 50, left: 30};
    const width = get(this, 'width');
    const height = get(this, 'height');
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const isIcon = width < 100 || height < 100;

    const x = scaleLinear().range([0, chartWidth]);
    const y = scaleLinear().range([chartHeight, 0]);

    svg.attr('style', 'width:' + width +'px;height:' + height +'px;');

    if (dataOrArray.length === 0) {
      return;
    }

    let valueline = line()
      .x(d => x(d.data))
      .y(d => y(Number.parseFloat(d.label)/100));

    x.domain([0, max(dataOrArray, d => d.data + 1)]);
    y.domain([min(dataOrArray, d => Math.floor(Number.parseFloat(d.label)/10))/10, max(dataOrArray, d => Math.ceil(Number.parseFloat(d.label)/10))/10]);

    const container = svg.append('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")");

    container.append("path")
      .data([dataOrArray])
      .attr("class", "line")
      .attr("d", valueline);

    container.append("g")
      .attr("transform", "translate(0," + chartHeight + ")").call(axisBottom(x));

    if (!isIcon) {
    container.append("text")
      .attr("transform", "translate(" + (chartWidth/2) + " ," + (chartHeight + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Label");
    }

    if (!isIcon) {
    container.append("g").call(axisLeft(y).tickFormat(format(".0%")));

    container.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 20 - margin.right)
      .attr("x", 0 - (chartHeight / 8))
      .attr("dy", "1em")
      .style("text-anchor", "start")
      .text("Value");
    }

  },
});
