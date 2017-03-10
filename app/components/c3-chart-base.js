import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  /*
  Here we set any settings that need to be applied
  to every chart based on this component
  avoiding code duplication
  and making stuff look nicer :)
  */
  axis: {
    x: {
      label: {
        text: 'Sessions',
        position: 'outer-center',
      }
    },
    y: {
      label: {
        text: 'Hours',
        position: 'outer-middle',
      }
    }
  },

  data: {
    order: 'asc'
  },

  tooltip: {
    show: true
  },

  color: {
    pattern: [
      '#d71611',
      '#AE59B6',
      '#F62459',
      '#913D88',
      '#053AA5',
      '#7E4CAC',
      '#B00F60',
      '#081E68',
      '#56017e',
    ]
  },

  legend: {
    show: true
  }
});
