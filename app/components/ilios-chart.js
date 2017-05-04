import Ember from 'ember';
const { Component, computed, get, String:EmberString } = Ember;
const { htmlSafe } = EmberString;

export default Component.extend({
  attributeBindings: ['style'],
  classNames: ['ilios-chart'],
  tagName: 'span',
  name: null,
  width: null,
  height: null,
  tooltip: null,
  tooltipSlice: null,
  tooltipLocation: null,
  chartName: computed('type', function(){
    const name = this.get('name');
    return `chart-${name}`;
  }),
  style: computed('width', 'heigth', 'tooltip', function(){
    const height = get(this, 'height');
    const width = get(this, 'width');

    return htmlSafe(`width: ${width * 1.2}px; height: ${height * 1.2}px`);
  }),

  actions: {
    hover(data, slice, tooltipLocation){
      const hover = get(this, 'hover');
      hover(data);
      this.set('tooltipSlice', slice);
      this.set('tooltipLocation', tooltipLocation);
    },
    leave(){
      const leave = get(this, 'leave');
      leave();
      this.set('tooltipSlice', null);
      this.set('tooltipLocation', null);
    },
  }
});
