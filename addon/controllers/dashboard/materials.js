import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DashboardMaterialsController extends Controller {
  queryParams = [{ courseParam: 'course' }, { filterParam: 'filter' }, { sortByParam: 'sortBy' }];

  @tracked courseParam = null;
  @tracked filterParam = null;
  @tracked sortByParam = null;

  get course() {
    return this.courseParam ?? '';
  }

  get filter() {
    return this.filterParam ?? '';
  }

  get sortBy() {
    return this.sortByParam ?? 'firstOfferingDate:desc';
  }

  @action
  setCourse(value) {
    this.courseParam = value === '' ? null : value;
  }

  @action
  setFilter(value) {
    this.filterParam = value === '' ? null : value;
  }

  @action
  setSortBy(value) {
    this.sortByParam = value === 'firstOfferingDate:desc' ? null : value;
  }
}
