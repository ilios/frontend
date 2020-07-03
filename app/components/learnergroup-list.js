import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency-decorators';
import { map } from 'rsvp';

export default class LearnerGroupListComponent extends Component {
  @tracked toCopy = [];
  @tracked toRemove = [];
  @tracked preparingToRemove = [];
  @tracked localSortBy = 'title';

  get sortBy() {
    return this.args.sortBy ?? this.localSortBy;
  }

  get sortedAscending(){
    return this.sortBy.search(/desc/) === -1;
  }

  @action
  cancelRemove(learnerGroup) {
    this.toRemove = this.toRemove.filter(({ id }) => id !== learnerGroup.id);
  }

  @task
  *confirmRemove(learnerGroup) {
    if (this.args.canDelete) {
      this.preparingToRemove = [...this.preparingToRemove, learnerGroup];
      const deletableGroup = yield this.createDeletableGroup(learnerGroup);
      this.toRemove = [...this.toRemove, deletableGroup];
      this.preparingToRemove = this.preparingToRemove.filter(lg => lg !== learnerGroup);
    }
  }

  @action
  cancelCopy(learnerGroup) {
    this.toCopy = this.toCopy.filter(lg => lg !== learnerGroup);
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
    if(this.sortBy === what){
      what += ':desc';
    }
    if (this.args.setSortBy) {
      this.args.setSortBy(what);
    }
    this.localSortBy = what;
  }

  async getCoursesForGroup(learnerGroup) {
    const offerings = (await learnerGroup.offerings).toArray();
    const ilms = (await learnerGroup.ilmSessions).toArray();
    const arr = [].concat(offerings, ilms);

    const sessions = await Promise.all(arr.mapBy('session'));
    const filteredSessions = sessions.filter(Boolean).uniq();
    const courses = await Promise.all(filteredSessions.mapBy('course'));
    const children = (await learnerGroup.children).toArray();
    const childCourses = await map(children, async (child) => {
      return await this.getCoursesForGroup(child);
    });

    return [].concat(courses, childCourses.flat()).uniq();
  }

  async createDeletableGroup(learnerGroup) {
    const courses = await this.getCoursesForGroup(learnerGroup);

    return { id: learnerGroup.id, courses };
  }
}
