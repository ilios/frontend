import Ember from 'ember';

const { Component, computed, isEmpty, String, $ } = Ember;
const { htmlSafe } = String;

export default Component.extend({
  classNameBindings: [':ilios-chart-tooltip', 'hidden:hidden'],
  attributeBindings: ['style'],
  width: 380,
  title: null,
  attr: null,
  content: null,
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
