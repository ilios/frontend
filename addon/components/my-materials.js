import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import { timeout } from 'ember-concurrency';
import {restartableTask} from "ember-concurrency-decorators";

const DEBOUNCE_DELAY = 250;

export default class MyMaterials extends Component {
  @tracked materials =  [];
  @tracked loading = true;

  get filteredMaterials() {
    let materials = this.materials;
    if (! this.materials) {
      return [];
    }

    if (isPresent(this.args.courseIdFilter)) {
      materials = this.materials.filterBy('course', this.args.courseIdFilter);
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
    return materials;
  }

  get courses() {
    if (! this.materials) {
      return [];
    }
    return this.materials.map((material) => {
      return { id: material.course, title: material.courseTitle };
    }).uniqBy('id').sortBy('title');
  }

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  sortString(a, b){
    return a.localeCompare(b);
  }

  @action
  sortBy(what){
    if (this.args.sortBy === what){
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @restartableTask
  *load(element, [materials]) {
    this.loading = true;
    this.materials = yield materials;
    this.loading = false;
  }

  @restartableTask
  *setQuery(query) {
    yield timeout(DEBOUNCE_DELAY);
    this.args.setFilter(query);
  }
}
