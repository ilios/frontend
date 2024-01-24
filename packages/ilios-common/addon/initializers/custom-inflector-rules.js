import Inflector from 'ember-inflector';

export function initialize() {
  const inflector = Inflector.inflector;
  inflector.irregular('pcrs', 'pcrses');
}

export default {
  initialize,
};
