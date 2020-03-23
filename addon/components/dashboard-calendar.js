import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask, restartableTask } from 'ember-concurrency-decorators';
import moment from 'moment';
import { all, map, hash } from 'rsvp';

export default class DashboardCalendarComponent extends Component {
  @service userEvents;
  @service schoolEvents;
  @service currentUser;
  @service store;
  @service intl;
  @service iliosConfig;

  @tracked cohortProxies = null;
  @tracked courses = null;
  @tracked sessionTypes = null;
  @tracked vocabularies = null;

  @tracked usersPrimarySchool;
  @tracked absoluteIcsUri;

  @tracked ourEvents = [];
  @tracked filterTags = [];

  courseLevels = ['1', '2', '3', '4', '5'];

  get fromTimeStamp() {
    return moment(this.args.selectedDate).startOf(this.args.selectedView).subtract(this.clockSkew, 'days').unix();
  }
  get toTimeStamp() {
    return moment(this.args.selectedDate).endOf(this.args.selectedView).add(this.clockSkew, 'days').unix();
  }
  get clockSkew() {
    if (this.selectedView === 'month') {
      return 6;
    }
    return 1;
  }

  constructor() {
    super(...arguments);
    this.setup.perform();
  }

  @dropTask
  *setup() {
    const user = yield this.currentUser.getModel();
    this.usersPrimarySchool = yield user.school;

    const icsFeedKey = user.icsFeedKey;
    const apiHost = this.iliosConfig.apiHost;
    const loc = window.location.protocol + '//' + window.location.hostname;
    const server = apiHost ? apiHost : loc;
    this.absoluteIcsUri = server + '/ics/' + icsFeedKey;
  }

  @restartableTask
  *load(event, [school, year]) {
    if (!school || !year) {
      return;
    }
    const promises = {
      cohortProxies: this.getCohortProxies(school, year),
      courses: this.getCourses(school, year),
      sessionTypes: this.getSessionTypes(school),
      vocabularies: this.getVocabularies(school),
    };
    const results = yield hash(promises);
    this.cohortProxies = results.cohortProxies;
    this.courses = results.courses;
    this.sessionTypes = results.sessionTypes;
    this.vocabularies = results.vocabularies;
  }

  @restartableTask
  *loadEvents(event, [school, fromTimeStamp, toTimeStamp]) {
    if (!school || !fromTimeStamp || !toTimeStamp) {
      return;
    }
    if (this.args.mySchedule) {
      this.ourEvents = yield this.userEvents.getEvents(fromTimeStamp, toTimeStamp);
    } else {
      this.ourEvents = yield this.schoolEvents.getEvents(school.id, fromTimeStamp, toTimeStamp);
    }
  }

  async getCohortProxies(school, year) {
    const cohorts = await school.getCohortsForYear(year.get('title'));
    const cohortProxies = await map(cohorts.toArray(), async cohort => {
      let displayTitle = cohort.get('title');
      if (!displayTitle) {
        const intl = this.get('intl');
        const classOfYear = await cohort.get('classOfYear');
        displayTitle = intl.t('general.classOf', { year: classOfYear });
      }
      const program = await cohort.program;

      return {
        id: cohort.id,
        programTitle: program.title,
        cohort,
        displayTitle
      };
    });

    return cohortProxies.sortBy('displayTitle');
  }

  async getCourses(school, year) {
    const courses = await this.store.query('course', {
      filters: {
        school: school.id,
        year: year.title,
      },
    });
    return courses.sortBy('title');
  }

  async getSessionTypes(school) {
    const types = await school.sessionTypes;
    return types.toArray().sortBy('title');
  }

  async getVocabularies(school) {
    const vocabularies = await school.get('vocabularies');
    await all(vocabularies.mapBy('terms'));
    return vocabularies.toArray().sortBy('title');
  }

  get cohorts() {
    return this.cohortProxies?.mapBy('cohort');
  }

  get activeFilters() {
    return [].concat(
      this.args.selectedSessionTypeIds || [],
      this.args.selectedCourseLevels || [],
      this.args.selectedCohortIds || [],
      this.args.selectedCourseIds || [],
      this.args.selectedTermIds || [],
    );
  }

  @restartableTask
  *loadFilterTags(element, [cohortProxies]) {
    if (!cohortProxies) {
      return;
    }
    const tags = yield all([
      this.getCourseLevelTags(),
      this.getSessionTypeTags(),
      this.getCohortTags(cohortProxies),
      this.getTermTags(),
      this.getCourseTags(),
    ]);
    this.filterTags = tags.flat();
  }

  async fetchModel(modelName, id) {
    const model = this.store.peekRecord(modelName, id);
    return model ? model : this.store.findRecord(modelName, id);
  }

  getCourseLevelTags() {
    return this.args.selectedCourseLevels.map((level) => {
      return {
        id: level,
        class: 'tag-course-level',
        remove: this.args.removeCourseLevel,
        name: this.intl.t('general.courseLevel', { level })
      };
    });
  }
  async getSessionTypeTags() {
    return map(this.args.selectedSessionTypeIds, async (id) => {
      const sessionType = await this.fetchModel('session-type', id);
      return {
        id,
        class: 'tag-session-type',
        remove: this.args.removeSessionTypeId,
        name: sessionType.title
      };
    });
  }
  getCohortTags(cohortProxies) {
    return this.args.selectedCohortIds.map((id) => {
      const proxy = cohortProxies.findBy('id', id);
      return {
        id,
        class: 'tag-cohort',
        remove: this.args.removeCohortId,
        name: `${proxy.displayTitle} ${proxy.programTitle}`
      };
    });
  }
  async getTermTags() {
    return map(this.args.selectedTermIds, async (id) => {
      const term = await this.fetchModel('term', id);
      const allTitles = await term.get('titleWithParentTitles');
      const vocabulary = await term.get('vocabulary');
      const title = vocabulary.get('title');
      return {
        id,
        class: 'tag-term',
        remove: this.args.removeTermId,
        name: `${title} > ${allTitles}`
      };
    });
  }
  async getCourseTags() {
    return map(this.args.selectedCourseIds, async (id) => {
      const course = await this.fetchModel('course', id);
      return {
        id,
        class: 'tag-course',
        remove: this.args.removeCourseId,
        name: course.title
      };
    });
  }

  get filteredEvents() {
    const eventTypes = [
      'eventsWithSelectedSessionTypes',
      'eventsWithSelectedCourseLevels',
      'eventsWithSelectedCohorts',
      'eventsWithSelectedCourses',
      'eventsWithSelectedTerms',
    ];
    const allFilteredEvents = eventTypes.map(name => {
      return this[name];
    });

    return this.ourEvents.filter(event => {
      return allFilteredEvents.every(arr => {
        return arr.includes(event);
      });
    });
  }

  get hasMoreThanOneSchool() {
    return this.args.allSchools.length > 1;
  }

  get bestSelectedSchool() {
    if (this.args.selectedSchool) {
      return this.args.selectedSchool;
    }

    return this.usersPrimarySchool;
  }

  get bestSelectedAcademicYear() {
    if (this.args.selectedAcademicYear) {
      return this.args.selectedAcademicYear;
    }

    return this.args.allAcademicYears.sortBy('title').lastObject;
  }

  get eventsWithSelectedSessionTypes() {
    if (!this.args.selectedSessionTypeIds?.length) {
      return this.ourEvents;
    }
    const selectedIds = this.args.selectedSessionTypeIds.map(Number);
    return this.ourEvents.filter(event => {
      return selectedIds.includes(event.sessionTypeId);
    });
  }

  get eventsWithSelectedCourseLevels() {
    if (!this.args.selectedCourseLevels?.length) {
      return this.ourEvents;
    }
    const levels = this.args.selectedCourseLevels.map(Number);
    return this.ourEvents.filter(event => {
      return levels.includes(event.courseLevel);
    });
  }

  get eventsWithSelectedCohorts() {
    if (!this.args.selectedCohortIds?.length) {
      return this.ourEvents;
    }
    const selectedIds = this.args.selectedCohortIds.map(Number);
    return this.ourEvents.filter(event => {
      const matchingCohorts = event.cohorts.filter(({ id }) => selectedIds.includes(id));
      return matchingCohorts.length > 0;
    });
  }

  get eventsWithSelectedCourses() {
    if (!this.args.selectedCourseIds?.length) {
      return this.ourEvents;
    }
    const selectedIds = this.args.selectedCourseIds.map(Number);
    return this.ourEvents.filter(event => {
      return selectedIds.includes(event.course);
    });
  }

  get eventsWithSelectedTerms() {
    if (!this.args.selectedTermIds?.length) {
      return this.ourEvents;
    }
    const selectedIds = this.args.selectedTermIds.map(Number);
    return this.ourEvents.filter(event => {
      const allTerms = [].concat(event.sessionTerms || [], event.courseTerms || []).mapBy('id');
      const matchingTerms = allTerms.filter(id => selectedIds.includes(id));
      return matchingTerms.length > 0;
    });
  }

  @action
  changeSchool(event) {
    this.args.changeSchool(event.target.value);
  }

  @action
  changeAcademicYear(event) {
    this.args.changeAcademicYear(event.target.value);
  }
}
