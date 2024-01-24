import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import escapeRegExp from 'ilios-common/utils/escape-reg-exp';
import { set } from '@ember/object';

export default class CourseVisualizeInstructorsController extends Controller {
  queryParams = ['name'];
  name = '';

  setName = restartableTask(async (name) => {
    const clean = escapeRegExp(name);
    if (clean) {
      await timeout(250);
    }
    set(this, 'name', clean);
  });
}
