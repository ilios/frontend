import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask, task } from 'ember-concurrency';
import { map } from 'rsvp';
import { uniqueValues } from 'ilios-common/utils/array-helpers';

export default class LearnerGroupListComponent extends Component {
  @service intl;
  @service iliosConfig;

  @tracked toCopy = [];
  @tracked toRemove = [];
  @tracked preparingToRemove = [];
  @tracked localSortBy = 'title';
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  get sortBy() {
    return this.args.sortBy ?? this.localSortBy;
  }

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  @action
  cancelRemove(learnerGroup) {
    this.toRemove = this.toRemove.filter(({ id }) => id !== learnerGroup.id);
  }

  @restartableTask
  *load() {
    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
  }

  @task
  *confirmRemove(learnerGroup) {
    this.preparingToRemove = [...this.preparingToRemove, learnerGroup];
    const deletableGroup = yield this.createDeletableGroup(learnerGroup);
    this.toRemove = [...this.toRemove, deletableGroup];
    this.preparingToRemove = this.preparingToRemove.filter((lg) => lg !== learnerGroup);
  }

  @action
  cancelCopy(learnerGroup) {
    this.toCopy = this.toCopy.filter((lg) => lg !== learnerGroup);
  }

  @action
  startCopy(learnerGroup) {
    this.toCopy = [...this.toCopy, learnerGroup];
  }

  @task
  *copy(withLearners, learnerGroup) {
    yield this.args.copy(withLearners, learnerGroup);
    this.cancelCopy(learnerGroup);
  }

  @action
  setSortBy(what) {
    if (this.sortBy === what) {
      what += ':desc';
    }
    if (this.args.setSortBy) {
      this.args.setSortBy(what);
    }
    this.localSortBy = what;
  }

  @action
  sortByTitle(learnerGroupA, learnerGroupB) {
    const locale = this.intl.get('primaryLocale');
    if ('title:desc' === this.sortBy) {
      return learnerGroupB.title.localeCompare(learnerGroupA.title, locale, { numeric: true });
    }
    return learnerGroupA.title.localeCompare(learnerGroupB.title, locale, { numeric: true });
  }

  async getCoursesForGroup(learnerGroup) {
    const offerings = (await learnerGroup.offerings).slice();
    const ilms = (await learnerGroup.ilmSessions).slice();
    const arr = [].concat(offerings, ilms);

    const sessions = await Promise.all(arr.mapBy('session'));
    const filteredSessions = uniqueValues(sessions.filter(Boolean));
    const courses = await Promise.all(filteredSessions.mapBy('course'));
    const children = (await learnerGroup.children).slice();
    const childCourses = await map(children, async (child) => {
      return await this.getCoursesForGroup(child);
    });

    return uniqueValues([].concat(courses, childCourses.flat()));
  }

  async createDeletableGroup(learnerGroup) {
    const courses = await this.getCoursesForGroup(learnerGroup);

    return { id: learnerGroup.id, courses };
  }
}
