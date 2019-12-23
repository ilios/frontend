import Component from '@glimmer/component';
import { action } from '@ember/object';
import { isNone, isPresent } from '@ember/utils';
import { timeout } from 'ember-concurrency';
import {restartableTask} from "ember-concurrency-decorators";

const DEBOUNCE_DELAY = 250;

export default class MyMaterials extends Component {

  get filteredMaterials() {
    let materials = this.args.materials;
    if (! this.args.materials) {
      return [];
    }

    if (isPresent(this.args.courseIdFilter)) {
      materials = this.args.materials.filterBy('course', this.args.courseIdFilter);
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
    if (! this.args.materials) {
      return [];
    }
    return this.args.materials.map((material) => {
      return { id: material.course, title: material.courseTitle };
    }).uniqBy('id').sortBy('title');
  }

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  get materialsAreLoading() {
    return isNone(this.args.materials);
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
  *setQuery(query) {
    yield timeout(DEBOUNCE_DELAY);
    this.args.setFilter(query);
  }
}
