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
    const dataOrArray = data?data:[{data: 1, label: '', empty: true}];
    const svg = select(this.element);
    const width = get(this, 'width');
    const height = get(this, 'height');
    const isIcon = width < 100 || height < 100;
    const margin = isIcon ? {top: 0, right: 0, bottom: 0, left: 0} : {top: 10, right: 20, bottom: 30, left: 25};
    const chartWidth = width - margin.left - margin.right;
    const color = scaleOrdinal(schemeCategory10);

    const x = scaleBand().range([0, chartWidth]).padding(0.4);
    x.domain(dataOrArray.map(d => d.label));

    svg.attr('style', 'width:' + width +'px;height:' + height +'px;');

    if (dataOrArray.length === 0) {
      return;
    }

    const container = svg.append('g').attr('transform', "translate(" + margin.left + "," + margin.top + ")");

    let chartHeight = height;

    if (!isIcon) {
      const bottomScale = container.append("g").call(axisBottom(x));
      const labels = bottomScale;
      if (!isIcon) {
        bottomScale.selectAll("text")
        .attr("y", 0)
        .attr("x", 10)
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

      chartHeight = height - margin.top - margin.bottom - maxLabelHeight;
      bottomScale.attr("transform", "translate(0," + chartHeight + ")");
    }

    const y = scaleLinear().range([chartHeight, 0]);
    y.domain([0, max(dataOrArray, d => d.total)]);

    if (!isIcon) {
      const leftScale = container.append("g").call(axisLeft(y));
      leftScale.selectAll("text")
      .attr("x", -8)
      .attr("y", y(y.ticks(10).pop()) + 0.5)
      .attr("dy", "0.35em")
      .attr("fill", "#000")
      .style("text-anchor", "end");
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
