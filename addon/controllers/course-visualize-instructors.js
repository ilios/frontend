import Controller from '@ember/controller';
import { restartableTask } from 'ember-concurrency-decorators';
import { timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';

export default class CourseVisualizeInstructorsController extends Controller {
  queryParams = ['name'];
  name = '';

  @restartableTask
  *setName(name) {
    const clean = escapeRegExp(name);
    if (clean) {
      yield timeout(250);
    }
    this.name = clean;
  }
}
