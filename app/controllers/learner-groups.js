import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class LearnerGroupsController extends Controller {
  queryParams = ['program', 'programYear', 'school', 'filter', 'sortBy'];

  @tracked programId;
  @tracked programYearId;
  @tracked schoolId;
  @tracked filter;
  @tracked sortBy = 'title';

  setTitleFilter = restartableTask(async (value) => {
    //if we already have a value or if resetting filter then add a keyboard delay
    if (this.filter && value) {
      await timeout(250);
    }
    this.filter = value;
  });
}
