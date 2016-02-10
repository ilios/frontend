import Ember from 'ember';

export function initialize() {
  var inflector = Ember.Inflector.inflector;
  
  inflector.uncountable('aamc-pcrs');
}

export default {
  name: 'inflector',
  initialize
};
