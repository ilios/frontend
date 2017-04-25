import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';

const { Component, run, get } = Ember;

export default Component.extend({
  tagName: 'svg',
  classNames: ['chart-legend'],
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
    const width = get(this, 'width');
    const height = get(this, 'height');
    const legendRectSize = 18;
    const legendSpacing = 4;
    const color = scaleOrdinal(schemeCategory10);

    svg.attr('style', 'width:' + width +'px;height:' + height +'px;');

    if (dataOrArray.length === 0) {
      return;
    }

    let legend = svg.selectAll('.legend')
      .data(dataOrArray)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .style("font", "12px")
      .attr("transform", (d, i) => { return "translate(0," + i * 20 + ")";
      });

    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', d =>  color(d.label))
      .style('stroke', d =>  color(d.label));

    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(d => { return d.label; });

  },
});
