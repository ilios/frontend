import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  /*
  Here we set any settings that need to be applied
  to every chart based on this component
  avoiding code duplication
  and making stuff look nicer :)
  */

  tooltip: {
    show: false
  },

  color: {
    pattern: [
      '#64CACF',
      '#DF7BAA',
      '#50AB85',
      '#8D6FCA',
    ]
  },

  legend: {
    show: true
  }
});
