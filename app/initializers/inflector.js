import Ember from 'ember';

export function initialize(/* container, application */) {
  var inflector = Ember.Inflector.inflector;
  // inflector.irregular('aamc-pcrs', 'aamc-pcrses');
  inflector.uncountable('aamcPcrs');
  inflector.uncountable('aamc-pcrs');
}

export default {
  name: 'inflector',
  initialize: initialize
};
