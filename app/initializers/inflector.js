import Ember from 'ember';

export function initialize(/* container, application */) {
  var inflector = Ember.Inflector.inflector;
  inflector.uncountable('aamcPcrs');
  inflector.uncountable('aamc-pcrs');
}

export default {
  name: 'inflector',
  before: ['ember-cli-mirage'],
  initialize: initialize
};
