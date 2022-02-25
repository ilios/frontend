import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone, isPresent } from '@ember/utils';
import { restartableTask, timeout } from 'ember-concurrency';

const DEBOUNCE_DELAY = 250;

export default class DashboardAllMaterialsComponent extends Component {
  @service currentUser;
  @service fetch;
  @service iliosConfig;

  @tracked courseId = null;
  @tracked filter = null;
  @tracked sortByParam = null;

  @tracked materials = null;

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  @restartableTask
  *load() {
    const user = yield this.currentUser.getModel();
    const url = `${this.iliosConfig.apiNameSpace}/usermaterials/${user.id}`;
    const data = yield this.fetch.getJsonFromApiHost(url);
    this.materials = data.userMaterials;
  }

  get filteredMaterials() {
    let materials = this.materials;
    if (!this.materials) {
      return [];
    }

    if (isPresent(this.courseId)) {
      materials = this.materials.filterBy('course', this.courseId);
    }

    if (isPresent(this.filter)) {
      materials = materials.filter(({ courseTitle, instructors, sessionTitle, title }) => {
        let searchString = `${title} ${courseTitle} ${sessionTitle} `;

        if (isPresent(instructors)) {
          searchString += instructors.join(' ');
        }

        return searchString.toLowerCase().includes(this.filter.toLowerCase());
      });
    }
    return materials;
  }

  get courses() {
    if (!this.materials) {
      return [];
    }
    return this.materials
      .map((material) => {
        return { id: material.course, title: material.courseTitle };
      })
      .uniqBy('id')
      .sortBy('title');
  }

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  get materialsAreLoading() {
    return isNone(this.materials);
  }

  @action
  sortString(a, b) {
    return a.localeCompare(b);
  }

  @action
  changeCourseIdFilter(event) {
    const value = event.target.value;
    this.courseId = value === '' ? null : value;
  }

  @restartableTask
  *setQuery(query) {
    yield timeout(DEBOUNCE_DELAY);
    this.filter = query;
  }

  get course() {
    return this.courseId ?? '';
  }

  get sortBy() {
    return this.sortByParam ?? 'firstOfferingDate:desc';
  }

  @action
  setSortBy(what) {
    if (this.sortByParam === what) {
      what += ':desc';
    }
    this.sortByParam = what;
  }
}
