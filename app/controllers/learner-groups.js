import Controller from '@ember/controller';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';

export default class LearnerGroupsController extends Controller {
  queryParams = ['program', 'programYear', 'school', 'filter'];

  @tracked programId;
  @tracked programYearId;
  @tracked schoolId;
  @tracked filter;

  @restartableTask
  *setTitleFilter(value) {
    //if we already have a value or if resetting filter then add a keyboard delay
    if (this.filter && value) {
      yield timeout(250);
    }
    this.filter = value;
  }
}
