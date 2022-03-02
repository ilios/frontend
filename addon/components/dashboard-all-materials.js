import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone, isPresent } from '@ember/utils';
import { restartableTask, timeout } from 'ember-concurrency';

const DEBOUNCE_DELAY = 250;
const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 25;

export default class DashboardAllMaterialsComponent extends Component {
  @service currentUser;
  @service fetch;
  @service iliosConfig;
  @tracked materials = null;
  @tracked offset = DEFAULT_OFFSET;
  @tracked limit = DEFAULT_LIMIT;

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

  get allfilteredMaterials() {
    let materials = this.materials;
    if (!this.materials) {
      return [];
    }

    if (isPresent(this.args.courseId)) {
      materials = this.materials.filterBy('course', this.args.courseId);
    }

    if (isPresent(this.args.filter)) {
      materials = materials.filter(({ courseTitle, instructors, sessionTitle, title }) => {
        let searchString = `${title} ${courseTitle} ${sessionTitle} `;

        if (isPresent(instructors)) {
          searchString += instructors.join(' ');
        }

        return searchString.toLowerCase().includes(this.args.filter.toLowerCase());
      });
    }

    const sortedMaterials = materials.sortBy(this.sortInfo.column);
    if (this.sortInfo.descending) {
      return sortedMaterials.reverse();
    }
    return sortedMaterials;
  }

  get sortInfo() {
    const parts = this.args.sortBy.split(':');
    const column = parts[0];
    const descending = parts.length > 1 && parts[1] === 'desc';

    return { column, descending, sortBy: this.args.sortBy };
  }

  get filteredMaterials() {
    if (this.limit >= this.total) {
      return this.allfilteredMaterials;
    }
    return this.allfilteredMaterials.slice(this.offset, this.offset + this.limit);
  }

  get total() {
    return this.allfilteredMaterials.length;
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
    return this.args.sortBy.search(/desc/) === -1;
  }

  get materialsAreLoading() {
    return isNone(this.materials);
  }

  @action
  sortString(a, b) {
    return a.localeCompare(b);
  }

  @action
  sortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  setLimit(limit) {
    this.limit = limit;
  }

  @action
  setOffset(offset) {
    this.offset = offset;
  }

  @action
  changeCourseIdFilter(event) {
    this.offset = DEFAULT_OFFSET;
    this.args.setCourseIdFilter(event.target.value);
  }

  @restartableTask
  *setQuery(query) {
    yield timeout(DEBOUNCE_DELAY);
    this.offset = DEFAULT_OFFSET;
    this.args.setFilter(query);
  }
}
