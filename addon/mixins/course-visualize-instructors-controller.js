import Mixin from '@ember/object/mixin';
import { task, timeout } from 'ember-concurrency';
import { isPresent } from '@ember/utils';
import escapeRegExp from '../utils/escape-reg-exp';

export default Mixin.create({
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
