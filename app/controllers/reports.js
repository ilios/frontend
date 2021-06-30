/* eslint-disable ember/no-computed-properties-in-native-classes */
import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ReportsController extends Controller {
  @service store;

  queryParams = ['report', 'reportYear'];

  report = null;
  reportYear = '';

  //@todo replace with a Resource [JJ 3/21]
  @computed('report', 'store')
  get selectedReport() {
    return new Promise((resolve) => {
      if (!this.report) {
        return null;
      }
      const report = this.store.peekRecord('report', this.report);
      if (report) {
        resolve(report);
      } else {
        resolve(this.store.findRecord('report', this.report));
      }
    });
  }
}
