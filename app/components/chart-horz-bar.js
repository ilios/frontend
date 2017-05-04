import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, scaleBand, scaleLinear, schemeCategory10 } from 'd3-scale';
import { max } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';

const { Component, run, get } = Ember;

export default Component.extend({
  tagName: 'svg',
  classNames: ['chart-horz-bar'],
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
    const margin = {top: 10, right: 20, bottom: 30, left: 25};
    const width = get(this, 'width');
    const height = get(this, 'height');
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const color = scaleOrdinal(schemeCategory10);

    const x = scaleLinear().range([chartWidth, 0]);
    const y = scaleBand().range([0, chartHeight]).padding(0.4);

    if (dataOrArray.length === 0) {
      return;
    }

    x.domain([0, max(dataOrArray, d => d.total)]);
    y.domain(dataOrArray.map(d => d.label));

    const container = svg.append('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")");

    const leftScale = container.append("g").call(axisLeft(y));
    const labels = leftScale.selectAll("text")
      .attr("y", 4)
      .attr("x", -8)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "#000");

    let maxLabelLeftPosition = width;
    labels.each(function(label, index, allLabels) {
      const currentLabel = allLabels[index];
      const labelDimensions = currentLabel.getBoundingClientRect();
      maxLabelLeftPosition = Math.max(maxLabelLeftPosition, chartWidth + labelDimensions.width + margin.left);
    });

    svg.attr('style', 'width:' + width +'px;height:' + maxLabelLeftPosition +'px;');

    const bottomScale = container.append("g").call(axisBottom(x));
    bottomScale.attr("transform", "translate(0," + chartWidth + ")")
      .selectAll("text")
      .attr("x", x(x.ticks(10).pop()) + 0.5)
      .attr("y", 16)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "#000");

    container.append("text")
      .attr("transform", "translate(" + (chartWidth/20) + " ," + (chartHeight + margin.top + 20) + ")")
      .style("text-anchor", "end")
      .text("Label");

    container.selectAll('.bar').data(dataOrArray).enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.total))
      .attr('y', d => y(d.label))
      .attr("height", y.bandwidth())
      .attr('fill', d =>  color(d.label))
      .attr('width', d => chartWidth - x(d.total));

  },
});
