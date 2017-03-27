import Ember from 'ember';

import { select } from 'd3-selection';
import { scaleOrdinal, schemeCategory10 } from 'd3-scale';
import { arc, pie } from 'd3-shape';
import { transition } from 'd3-transition';
import { easeLinear } from 'd3-ease';
import { interpolate } from 'd3-interpolate';

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
    const color = scaleOrdinal(schemeCategory10);

    let t = transition().duration(2000).ease(easeLinear);

    /*let t2 = transition()
          .ease(easeLinear)
          .duration(2000)
          .attrTween("d", tweenPie);
    */
    let createArc = arc().innerRadius(0).outerRadius(radius);
    let createPie = pie().value(d => d.data).sort(null);
    let createLabelArc = arc().outerRadius(radius - 32).innerRadius(radius - 32);

    let chart = svg.append('g').attr('class', 'pie').attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');
    let path = chart.selectAll('path').data(createPie(dataOrArray)).enter()
      .append('g').attr('class', 'slice')
      .append('path')
      .attr('class', 'slicepath')
      .attr('d', createArc)
      .attr('stroke', '#FFFFFF')
      .attr('fill', d =>  color(d.data.label));

    chart.selectAll('path.slicepath').transition()
      .ease(easeLinear)
      .duration(1000)
      .attrTween("d", tweenPie);

    function tweenPie(b) {
      b.innerRadius = 0;
      var i = interpolate({startAngle: 0, endAngle: 0}, b);
      return function(t) { return createArc(i(t)); };
    }

    path.on('mouseover', d => displayTooltip(d.data));
    path.on('mouseout', d => hideTooltip.duration(2000)(d.data));

    path.exit()
      .transition(t)
      .attr('d', 0)
      .remove();

    let g = chart.selectAll('g.pie')
      .data(createPie(dataOrArray))
      .enter().append('g')
      .attr('class', 'arc');

    g.append("text")
      .transition(t)
      .delay(2000)
      .attr("fill", "#ffffff")
      .style("font-size", ".8rem")
      .attr('transform', d => "translate(" + createLabelArc.centroid(d) + ")")
      .attr("dy", ".40rem")
      .attr("text-anchor", "middle")
      .text(d => d.data.label);

  },
});
