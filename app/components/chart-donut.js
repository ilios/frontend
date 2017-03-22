import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, schemeCategory20 } from 'd3-scale';
import { arc, pie } from 'd3-shape';

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
    const svg = select(this.element);
    const width = get(this, 'width');
    const height = get(this, 'height');
    const radius = Math.min(width, height) / 2;
    const donutWidth = width * .2;
    const color = scaleOrdinal(schemeCategory20);

    let createArc = arc().innerRadius(radius - donutWidth).outerRadius(radius);
    let createPie = pie().value(d => d.data).sort(null);
    let createLabelArc = arc().outerRadius(radius - 32).innerRadius(radius - 32);

    let chart = svg.append('g').attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');
    chart.selectAll('path').data(createPie(dataOrArray)).enter()
      .append('path')
      .attr('d', createArc)

      .attr('fill', d =>  color(d.data.label));

    let g = chart.selectAll('g')
      .data(createPie(dataOrArray))
      .enter().append('g')
      .attr('class', 'arc');

    g.append("text")
      .attr("fill", "#ffffff")
      .attr('transform', d => "translate(" + createLabelArc.centroid(d) + ")")
      .attr("dy", ".35em")
      .text(d => d.data.label);
  },
});
