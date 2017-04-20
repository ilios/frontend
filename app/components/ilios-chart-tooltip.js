import Ember from 'ember';

const { Component, computed, get, isEmpty, run, String, $ } = Ember;
import { select } from 'd3-selection';
const { htmlSafe } = String;

export default Component.extend({
  classNameBindings: [':ilios-chart-tooltip', 'hidden:hidden'],
  attributeBindings: ['style'],
  width: 380,
  title: null,
  attr: null,
  content: null,
  didReceiveAttrs() {
    // Anytime we get an update schedule a draw
    run.scheduleOnce('render', this, this.draw);
  },
  draw(){
    const root = select(this.element);
    // total tootlip hack
    const parentActions = get(this.parentView, 'actions');
    const hover = parentActions.hoverTooltip;
    const leave = parentActions.leave.bind(this.parentView);
    root.on('mouseover', function() {
      hover();
    });
    root.on('mouseout', () => {
      leave();
    });
  },
  style: computed('slice', 'location', function(){
    const slice = this.get('slice');
    const location = this.get('location');
    const width = this.get('width');
    if (isEmpty(slice) || isEmpty(location) ) {
      return htmlSafe('');
    }

    let svgParent = $(slice.nearestViewportElement);
    let svgParentsvgOffset = $(svgParent).offset();
    let svgParentOffset = $(svgParent).parent().offsetParent().offset();
    let svgDimensions = {
      width: $(svgParent).width(),
      height: $(svgParent).height(),
    };

    let tooltipTop = svgParentsvgOffset.top - svgParentOffset.top + svgDimensions.height / 2 + location[1] + 20;
    let tooltipLeft = Math.max(0 ,svgParentsvgOffset.left - svgParentOffset.left + svgDimensions.width / 2 - width / 2 + location[0]);

    return htmlSafe('top:' + tooltipTop + 'px; left:' + tooltipLeft + 'px;');
  }),
  hidden: computed('content', function(){
    const content = this.get('content');
    return isEmpty(content);
  }),
});
