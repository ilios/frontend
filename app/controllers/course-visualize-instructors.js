import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
import escapeRegExp from '../utils/escape-reg-exp';

export default Controller.extend({
  queryParams: ['name'],
  name: '',

  setName: task(function* (name) {
    const clean = escapeRegExp(name);
    if (isPresent(clean)) {
      yield timeout(250);
    }
    this.set('name', clean);
  }).restartable(),

});
