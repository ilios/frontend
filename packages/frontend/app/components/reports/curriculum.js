import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueById } from 'ilios-common/utils/array-helpers';

export default class ReportsCurriculumComponent extends Component {
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

  run = restartableTask(async () => {
    if (!this.passedCourseIds.length) {
      this.reportResults = null;
      return;
    }
    const filters = [`ids: [${this.passedCourseIds.join(', ')}]`];
    const userData = ['id', 'firstName', 'lastName', 'middleName', 'displayName'].join(', ');
    const sessionData = [
      'id',
      'title',
      'sessionType { title }',
      'sessionObjectives { id, title }',
      `offerings { id, startDate, endDate, instructors { ${userData} }, instructorGroups { id, users { ${userData} } } }`,
      `ilmSession { id, dueDate, hours, instructors { ${userData} }, instructorGroups { id, users { ${userData} } } }`,
    ].join(', ');

    const data = ['id', 'title', 'year', `sessions { ${sessionData} }`];
    const result = await this.graphql.find('courses', filters, data.join(', '));

    this.reportResults = result.data.courses;
  });

  pickCourse = (id) => {
    this.args.setSelectedCourseIds([...this.passedCourseIds, id].sort());
  };

  removeCourse = (id) => {
    this.args.setSelectedCourseIds(this.passedCourseIds.filter((i) => i !== Number(id)).sort());
  };
}
