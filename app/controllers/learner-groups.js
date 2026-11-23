import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class LearnerGroupsController extends Controller {
  queryParams = ['program', 'programYear', 'school', 'filter', 'sortBy'];

  @tracked program;
  @tracked programYear;
  @tracked school;
  @tracked filter;
  @tracked sortBy = 'title';

  changeTitleFilter = task({ restartable: true }, async (value) => {
    this.filter = value;
  });
}
