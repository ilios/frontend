import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class InstructorGroupsController extends Controller {
  queryParams = [{ schoolId: 'school' }, { titleFilter: 'filter' }, 'sortBy'];
  @tracked schoolId;
  @tracked titleFilter;
  @tracked sortBy = 'title';

  changeTitleFilter = restartableTask(async (value) => {
    this.titleFilter = value;
    await timeout(250);
    return value;
  });
}
