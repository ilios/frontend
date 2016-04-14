import Ember from 'ember';

const { Component, computed } = Ember;

export default Component.extend({
  tagName: 'div',
  classNames: ['pre-fill'],
  lines: 4,
  linesMinusOne: computed('lines', function(){
    return parseInt(this.get('lines'))-1;
  }),
});
