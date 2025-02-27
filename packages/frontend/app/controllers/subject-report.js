import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ReportsSubjectController extends Controller {
  @service store;

  queryParams = ['report', 'reportYear'];
  resultsLengthMax = 100;

  @tracked report = null;
  @tracked reportYear = '';
}
