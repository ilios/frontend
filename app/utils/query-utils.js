import Ember from 'ember';

const { trim } = Ember.$;

export function cleanQuery(query) {
  return trim(query).replace(/[-,?~!@#$%&*+'="]/, ' ');
}
