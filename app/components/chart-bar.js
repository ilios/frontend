import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, scaleBand, scaleLinear, schemeCategory10 } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';

const { Component, run, get } = Ember;

export default Component.extend({
  tagName: 'svg',
  classNames: ['chart-bar'],
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
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const chartWidth = get(this, 'width') - margin.left - margin.right;
    const chartHeight = get(this, 'height')- margin.top - margin.bottom;
    const color = scaleOrdinal(schemeCategory10);

    const x = scaleBand().range([0, chartWidth]).padding(0.1);
    const y = scaleLinear().range([chartHeight, 0]);

    x.domain(dataOrArray.map(d => d.label));
    y.domain([0, max(dataOrArray, d => d.total)]);

    svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    svg.selectAll('.bar').data(dataOrArray).enter()
      .append('rect').attr('class', 'bar')
      .attr("class", "bar")
      .attr('x', d => x(d.label))
      .attr("width", x.bandwidth())
      .attr('y', d => y(d.total))
      .attr('height', d => chartHeight - y(d.total))
      .attr('fill', d =>  color(d.label));

    svg.append("g").attr("transform", "translate(0," + chartHeight + ")").call(axisBottom(x))
      .selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(75)")
      .style("text-anchor", "start");
  },
});
