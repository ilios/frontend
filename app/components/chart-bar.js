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
    const margin = {top: 10, right: 20, bottom: 30, left: 25};
    const width = get(this, 'width');
    const height = get(this, 'height');
    const chartWidth = width - margin.left - margin.right;
    const color = scaleOrdinal(schemeCategory10);
    const isIcon = width < 100 || height < 100;

    const x = scaleBand().range([0, chartWidth]).padding(0.4);

    svg.attr('style', 'width:' + width +'px;height:' + height +'px;');

    if (dataOrArray.length === 0) {
      return;
    }

    x.domain(dataOrArray.map(d => d.label));
    const container = svg.append('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")");

    const bottomScale = container.append("g").call(axisBottom(x));
    const labels = bottomScale;
    if (!isIcon) {
      bottomScale.selectAll("text")
      .attr("y", 0)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(75)")
      .style("text-anchor", "start");
    }

    // This loop will figure out the tallest bottom label height,
    // so that it can be substracted to
    // the available height for the chart.
    let maxLabelHeight = 0;
    labels.each(function(label, index, allLabels) {
      const currentLabel = allLabels[index];
      const labelDimensions = currentLabel.getBoundingClientRect();
      maxLabelHeight = Math.max(maxLabelHeight, Math.ceil(labelDimensions.height));
    });

    const chartHeight = height - margin.top - margin.bottom - maxLabelHeight;
    const y = scaleLinear().range([chartHeight, 0]);
    y.domain([0, max(dataOrArray, d => d.total)]);
    bottomScale.attr("transform", "translate(0," + chartHeight + ")");

    if (!isIcon) {
      container.append("text")
      .attr("transform", "translate(" + (chartWidth/20) + " ," + (chartHeight + margin.top + 20) + ")")
      .style("text-anchor", "end")
      .attr("font", "10px")
      .text("Label");

      container.append("g").call(axisLeft(y))
      .selectAll("text")
      .attr("x", -8)
      .attr("y", y(y.ticks(10).pop()) + 0.5)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .attr("fill", "#000");
    }

    container.selectAll('.bar').data(dataOrArray).enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.label))
      .attr('y', d => y(d.total))
      .attr("width", x.bandwidth())
      .attr('height', d => chartHeight - y(d.total))
      .attr('fill', d =>  color(d.label));

  },
});
