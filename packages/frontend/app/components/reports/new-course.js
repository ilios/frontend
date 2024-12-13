import Component from '@glimmer/component';
import { service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueById } from 'ilios-common/utils/array-helpers';
import { DateTime } from 'luxon';

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
    const filters = [`ids: [${this.passedCourseIds.join(', ')}]`];
    const sessionQuery =
      'sessions { id, title, sessionType { title }, offerings { startDate, endDate }, ilmSession { hours, dueDate } }';
    const result = await this.graphql.find(
      'courses',
      filters,
      `id, title, year, externalId, ${sessionQuery}`,
    );
    const { courses } = result.data;

    const activities = this.buildActivities(courses);

    activities.sort((a, b) => DateTime.fromISO(a.startDate) - DateTime.fromISO(b.startDate));

    this.reportResults = activities;
  });

  buildActivities(courses) {
    return courses
      .map((course) => {
        return course.sessions
          .map((session) => {
            const offerings = session.offerings.map(({ startDate, endDate }) => {
              const luxonStartDate = DateTime.fromISO(startDate);
              const luxonEndDate = DateTime.fromISO(endDate);
              const { minutes } = luxonEndDate.diff(luxonStartDate, 'minutes').toObject();
              return {
                startDate,
                endDate,
                luxonStartDate,
                minutes,
              };
            });

            if (session.ilmSession) {
              const { hours, dueDate } = session.ilmSession;
              const luxonStartDate = DateTime.fromISO(dueDate);
              const luxonEndDate = luxonStartDate.plus({ hours });
              const { minutes } = luxonEndDate.diff(luxonStartDate, 'minutes').toObject();
              offerings.push({
                startDate: dueDate,
                luxonStartDate,
                minutes,
              });
            }

            offerings.sort((a, b) => a.luxonStartDate - b.luxonStartDate);

            const startDate = offerings.length ? offerings[0].startDate : null;
            const minutes = offerings.length ? offerings[0].minutes : null;
            const origin = window.location.origin;
            const path = this.router.urlFor('session', course.id, session.id);

            return {
              courseId: course.id,
              courseTitle: course.title,
              sessionId: session.id,
              sessionTitle: session.title,
              sessionType: session.sessionType.title,
              startDate,
              minutes,
              link: `${origin}${path}`,
            };
          })
          .filter(Boolean);
      })
      .flat();
  }

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
