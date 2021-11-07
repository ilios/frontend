import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class InstructorGroupsController extends Controller {
  queryParams = [{ schoolId: 'school' }, { titleFilter: 'filter' }];
  @tracked schoolId;
  @tracked titleFilter;

  @restartableTask
  *changeTitleFilter(value) {
    this.titleFilter = value;
    yield timeout(250);
    return value;
  }
}
