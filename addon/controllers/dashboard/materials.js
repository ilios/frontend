import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const DEFAULT_LIMIT = 25;

export default class DashboardMaterialsController extends Controller {
  queryParams = [
    { courseParam: 'course' },
    { filterParam: 'filter' },
    { sortByParam: 'sortBy' },
    { showAllMaterialsParam: 'showAll' },
    { limitParam: 'limit' },
    { offsetParam: 'offset' },
  ];

  @tracked courseParam = null;
  @tracked filterParam = null;
  @tracked sortByParam = null;
  @tracked limitParam = null;
  @tracked offsetParam = null;
  @tracked showAllMaterialsParam = null;

  get offset() {
    return this.offsetParam ?? 0;
  }

  get limit() {
    return this.limitParam ?? DEFAULT_LIMIT;
  }

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
  setOffset(value) {
    this.offsetParam = value ?? null;
  }

  @action
  setLimit(value) {
    this.limitParam = value ?? null;
  }

  @action
  setSortBy(value) {
    this.sortByParam = value === 'firstOfferingDate:desc' ? null : value;
  }

  @action
  toggleMaterialsMode() {
    this.setLimit(null);
    this.setOffset(null);
    this.showAllMaterialsParam = this.showAllMaterialsParam ? null : true;
  }
}
