import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, schemeCategory20b } from 'd3-scale';
import { arc, pie } from 'd3-shape';
import { sum } from 'd3-array';

const { Component, run, get } = Ember;

export default Component.extend({
  tagName: 'svg',
  classNames: ['chart-donut'],
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
    const plot = select(this.element);

    const width = get(this, 'width');
    const height = get(this, 'height');
    const radius = Math.min(width, height) / 2;
    const color = scaleOrdinal(schemeCategory20b);

    let createArc = arc().innerRadius(0).outerRadius(radius);
    let createPie = pie().value(d => {
      return sum(d.data);
    }).sort(null);

    let chart = plot.selectAll('path').data(createPie(dataOrArray));
    chart.enter()
      .append('path')
      .attr('d', createArc)
      .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')')
      .attr('fill', d =>  color(d.data.label));

  },
});
