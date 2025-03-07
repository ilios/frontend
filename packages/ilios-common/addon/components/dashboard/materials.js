import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { restartableTask, timeout } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { DateTime } from 'luxon';
import { filterBy, sortBy, uniqueById } from 'ilios-common/utils/array-helpers';

const DEBOUNCE_DELAY = 250;

export default class DashboardMaterialsComponent extends Component {
  daysInAdvance = 60;
  @service store;
  @service fetch;
  @service iliosConfig;
  @tracked showAllMaterials = false;
  @service currentUser;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.loadCourse(this.args.courseIdFilter));
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get courseLoaded() {
    return this.courseData.isResolved;
  }

  @cached
  get materialsData() {
    return new TrackedAsyncData(this.loadMaterials(this.args.showAllMaterials));
  }

  get materials() {
    return this.materialsData.isResolved ? this.materialsData.value : [];
  }

  get materialsLoaded() {
    return this.materialsData.isResolved;
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : null;
  }

  async loadMaterials() {
    const user = await this.currentUser.getModel();
    let url = `${this.iliosConfig.apiNameSpace}/usermaterials/${user.id}`;
    if (!this.args.showAllMaterials) {
      const now = DateTime.now();
      const from = now.set({ hour: 0, minute: 0 }).toUnixInteger();
      const to = now
        .set({ hour: 23, minute: 59 })
        .plus({ day: this.daysInAdvance })
        .toUnixInteger();
      url += `?before=${to}&after=${from}`;
    }
    const data = await this.fetch.getJsonFromApiHost(url);
    return data.userMaterials;
  }

  async loadCourse(courseId) {
    let course = null;
    try {
      course = await this.store.findRecord('course', courseId);
    } catch {
      // eat the exception
    }
    return course;
  }

  get canApplyCourseFilter() {
    if (isPresent(this.args.courseIdFilter)) {
      return this.materialsFilteredByCourse.length;
    }
    return true;
  }

  get materialsFilteredByCourse() {
    if (isPresent(this.args.courseIdFilter)) {
      return filterBy(this.materials, 'course', this.args.courseIdFilter);
    }
    return this.materials;
  }

  get allFilteredMaterials() {
    let materials = this.materialsFilteredByCourse;

    if (isPresent(this.args.filter)) {
      materials = materials.filter(({ courseTitle, instructors, sessionTitle, title }) => {
        let searchString = `${title} ${courseTitle} ${sessionTitle} `;

        if (isPresent(instructors)) {
          searchString += instructors.join(' ');
        }

        return searchString.toLowerCase().includes(this.args.filter.toLowerCase());
      });
    }

    const sortedMaterials = sortBy(materials, this.sortInfo.column);
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
    if (this.args.limit >= this.total) {
      return this.allFilteredMaterials;
    }
    return this.allFilteredMaterials.slice(this.args.offset, this.args.offset + this.args.limit);
  }

  get total() {
    return this.allFilteredMaterials.length;
  }

  get courses() {
    if (!this.materials) {
      return [];
    }
    const arr = this.materials.map((material) => {
      return {
        id: material.course,
        title: material.courseTitle,
        externalId: material.courseExternalId,
        year: material.courseYear,
      };
    });

    return sortBy(uniqueById(arr), ['year', 'title']);
  }

  get sortedAscending() {
    return this.args.sortBy.search(/desc/) === -1;
  }

  @action
  sortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  changeCourseIdFilter(event) {
    this.args.setOffset(0);
    this.args.setCourseIdFilter(event.target.value);
  }

  setQuery = restartableTask(async (query) => {
    await timeout(DEBOUNCE_DELAY);
    this.args.setOffset(0);
    this.args.setFilter(query);
  });
}
