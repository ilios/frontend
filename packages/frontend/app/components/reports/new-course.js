import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueById } from 'ilios-common/utils/array-helpers';

export default class ReportsNewCourseComponent extends Component {
  @service store;
  @service graphql;
  @service router;

  @tracked searchResults = null;
  @tracked reportResults = null;

  get passedCourseIds() {
    return this.args.selectedCourseIds?.map(Number) ?? [];
  }

  @cached
  get selectedCourseData() {
    const loadedCourses = this.passedCourseIds
      .map((id) => this.store.peekRecord('course', id))
      .filter(Boolean);
    const loadedIds = loadedCourses.map(({ id }) => id);
    const unloadedCoursIds = this.passedCourseIds.filter((id) => !loadedIds.includes(id));
    const courseLoadingPromises = unloadedCoursIds.map((id) => this.store.findRecord('course', id));
    return new TrackedAsyncData(Promise.all([...loadedCourses, ...courseLoadingPromises]));
  }

  get selectedCourses() {
    if (!this.selectedCourseData.isResolved) {
      return [];
    }

    return uniqueById(this.selectedCourseData.value).toSorted(this.sortCourses);
  }

  get uniqueId() {
    return guidFor(this);
  }

  get sortedSearchResults() {
    return this.searchResults?.toSorted(this.sortCourses);
  }

  sortCourses(a, b) {
    if (a.year !== b.year) {
      return b.year - a.year;
    }

    return a.title.localeCompare(b.title);
  }

  @restartableTask
  *search(q) {
    if (!q.length) {
      this.searchResults = null;
      return;
    }

    this.searchResults = yield this.store.query('course', {
      q,
    });
  }

  run = restartableTask(async () => {
    if (!this.passedCourseIds.length) {
      this.reportResults = null;
      return;
    }
    const filters = [`courses: [${this.passedCourseIds.join(', ')}]`];
    const data = 'title, session { id, title, sessionType { title }, course { id, title, year } }';
    const result = await this.graphql.find('sessionObjectives', filters, data);

    this.reportResults = result.data.sessionObjectives;
  });

  close = () => {
    this.searchResults = false;
    this.args.setSelectedCourseIds(null);
    this.args.close();
  };

  pickCourse = (id) => {
    this.args.setSelectedCourseIds([...this.passedCourseIds, id].sort());
  };

  removeCourse = (id) => {
    this.args.setSelectedCourseIds(this.passedCourseIds.filter((i) => i !== Number(id)).sort());
  };
}
