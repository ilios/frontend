import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { arc, pie } from 'd3-shape';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';

const { Component, run, get } = Ember;

export default Component.extend({
  tagName: 'svg',
  classNames: ['chart-pie'],
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
    const displayTooltip = get(this, 'displayTooltip');
    const hideTooltip = get(this, 'hideTooltip');
    const radius = Math.min(width, height) / 2;
    const donutWidth = width * .2;
    const color = scaleOrdinal(schemeCategory10);

    let t = transition().duration(2000).ease(easeLinear);
    
    let createArc = arc().innerRadius(radius - donutWidth).outerRadius(radius);
    let createPie = pie().value(d => d.data).sort(null);
    let createLabelArc = arc().outerRadius(radius - 32).innerRadius(radius - 32);

    let chart = svg.append('g').attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');
    let path = chart.selectAll('path').data(createPie(dataOrArray)).enter()
      .append('path')
      .attr('d', createArc)
      .attr('stroke', '#FFFFFF')
      .attr('fill', d =>  color(d.data.label));

    path.on('mouseover', d => displayTooltip(d.data));
    path.on('mouseout', d => hideTooltip(d.data));

    path.exit()
      .transition(t)
      .attr('d', 0)
      .remove();

    let enterJoin = path.enter()
     .append('path')
     .attr('d', 0)
     .attr('fill', d =>  color(d.data.label));

    enterJoin.merge(path)
    .transition(t)
      .attr('d', createArc);

    let g = chart.selectAll('g')
      .data(createPie(dataOrArray))
      .enter().append('g')
      .attr('class', 'arc');

    g.append("text")
      .transition(t)
      .attr("fill", "#ffffff")
      .style("font-size", ".8rem")
      .attr('transform', d => "translate(" + createLabelArc.centroid(d) + ")")
      .attr("dy", ".40rem")
      .attr("text-anchor", "middle")
      .text(d => d.data.label);
  },
});
