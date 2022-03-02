import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class DashboardMaterialsController extends Controller {
  queryParams = [
    { courseParam: 'course' },
    { filterParam: 'filter' },
    { sortByParam: 'sortBy' },
    { showAllMaterialsParam: 'showAll' },
  ];

  @tracked courseParam = null;
  @tracked filterParam = null;
  @tracked sortByParam = null;
  @tracked showAllMaterialsParam = null;

  get course() {
    return this.courseParam ?? '';
  }

  get filter() {
    return this.filterParam ?? '';
  }

  get sortBy() {
    return this.sortByParam ?? 'firstOfferingDate:desc';
  }

  get showAllMaterials() {
    return this.showAllMaterialsParam ?? false;
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

  @action
  toggleMaterialsMode() {
    this.showAllMaterialsParam = this.showAllMaterialsParam ? null : true;
  }
}
