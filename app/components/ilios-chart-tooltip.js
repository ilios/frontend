import Ember from 'ember';

const { Component, computed, isEmpty, String:EmberString, $ } = Ember;
const { htmlSafe } = EmberString;

export default Component.extend({
  classNameBindings: [':ilios-chart-tooltip', 'hidden:hidden'],
  attributeBindings: ['style'],
  width: 380,
  title: null,
  attr: null,
  content: null,
  location: null,
  style: computed('slice', 'location', function(){
    const slice = this.get('slice');
    const position = this.get('location');
    const width = this.get('width');
    if (isEmpty(slice) || isEmpty(position) ) {
      return htmlSafe('');
    }

    let svgParent = $(slice.nearestViewportElement);
    let svgParentsvgOffset = $(svgParent).offset();
    let svgParentOffset = $(svgParent).parent().offsetParent().offset();
    let svgDimensions = {
      width: $(svgParent).width(),
      height: $(svgParent).height(),
    };

    let tooltipTop = svgParentsvgOffset.top - svgParentOffset.top + svgDimensions.height / 2 + position[1] + 20;
    let tooltipLeft = Math.max(0 ,svgParentsvgOffset.left - svgParentOffset.left + svgDimensions.width / 2 - width / 2 + position[0]);

    return htmlSafe('top:' + tooltipTop + 'px; left:' + tooltipLeft + 'px;');
  }),
  hidden: computed('content', function(){
    const content = this.get('content');
    return isEmpty(content);
  }),
});
