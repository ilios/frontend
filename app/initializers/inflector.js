import Inflector from 'ember-inflector';

export function initialize() {
  Inflector.inflector.irregular('vocabulary', 'vocabularies');
  Inflector.inflector.uncountable('aamc-pcrs');
}

export default {
  name: 'inflector',
  initialize
};
