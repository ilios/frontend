import Controller from '@ember/controller';
import { task, timeout } from 'ember-concurrency';

export default Controller.extend({
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter',
  },

  changeTitleFilter: task(function* (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),
});
