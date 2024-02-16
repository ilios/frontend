import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';

export default class ReportsController extends Controller {
  queryParams = [{ sortReportsBy: 'sortBy' }, { titleFilter: 'filter' }];

  @tracked sortReportsBy = 'title';
  @tracked titleFilter = null;

  changeTitleFilter = restartableTask(async value => {
    this.titleFilter = value;
    await timeout(250);
    return value;
  });
}
