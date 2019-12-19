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

  courseLevels = [1, 2, 3, 4, 5];

  get calendarDate() {
    return moment(this.args.selectedDate, 'YYYY-MM-DD');
  }

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
    if (!fromTimeStamp || !toTimeStamp) {
      return;
    }
    if (this.args.mySchedule) {
      this.ourEvents = yield this.userEvents.getEvents(fromTimeStamp, toTimeStamp);
    } else {
      this.ourEvents = yield this.schoolEvents.getEvents(school.id, fromTimeStamp, toTimeStamp);
    }
  }

  @restartableTask
  *loadFilterTags(event, [activeFilters]) {
    this.filterTags = yield map(activeFilters, async filter => {
      const hash = { filter };
      if (typeof filter === 'number') {
        hash.class = 'tag-course-level';
        hash.name = `Course Level ${filter}`;
      } else {
        const model = filter.constructor.modelName;
        switch (model) {
        case 'session-type':
          hash.class = 'tag-session-type';
          hash.name = filter.title;
          break;
        case 'cohort': {
          hash.class = 'tag-cohort';
          const proxy = this.cohortProxies.findBy('id', filter.id);
          hash.name = `${proxy.displayTitle} ${proxy.programTitle}`;
          break;
        }
        case 'term': {
          hash.class = 'tag-term';
          const allTitles = await filter.get('titleWithParentTitles');
          const vocabulary = await filter.get('vocabulary');
          const title = vocabulary.get('title');
          hash.name = `${title} > ${allTitles}`;
          break;
        }
        case 'course':
          hash.class = 'tag-course';
          hash.name = filter.get('title');
          break;
        }
      }

      return hash;
    });
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
    return this.cohortProxies.mapBy('cohort');
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

  get activeFilters() {
    return [].concat(
      this.args.selectedSessionTypes || [],
      this.args.selectedCourseLevels || [],
      this.args.selectedCohorts || [],
      this.args.selectedCourses || [],
      this.args.selectedTerms || [],
    );
  }

  get eventsWithSelectedSessionTypes() {
    if (!this.args.selectedSessionTypes || !this.args.selectedSessionTypes.length) {
      return this.ourEvents;
    }
    const selectedIds = this.args.selectedSessionTypes.mapBy('id').map(Number);
    return this.ourEvents.filter(event => {
      return selectedIds.includes(event.sessionTypeId);
    });
  }

  get eventsWithSelectedCourseLevels() {
    if (!this.args.selectedCourseLevels || !this.args.selectedCourseLevels.length) {
      return this.ourEvents;
    }
    return this.ourEvents.filter(event => {
      return this.args.selectedCourseLevels.includes(event.courseLevel);
    });
  }

  get eventsWithSelectedCohorts() {
    if (!this.args.selectedCohorts || !this.args.selectedCohorts.length) {
      return this.ourEvents;
    }
    const selectedIds = this.args.selectedCohorts.mapBy('id').map(Number);
    return this.ourEvents.filter(event => {
      const matchingCohorts = event.cohorts.filter(({ id }) => selectedIds.includes(id));
      return matchingCohorts.length > 0;
    });
  }

  get eventsWithSelectedCourses() {
    if (!this.args.selectedCourses || !this.args.selectedCourses.length) {
      return this.ourEvents;
    }
    const selectedIds = this.args.selectedCourses.mapBy('id').map(Number);
    return this.ourEvents.filter(event => {
      return selectedIds.includes(event.course);
    });
  }

  get eventsWithSelectedTerms() {
    if (!this.args.selectedTerms || !this.args.selectedTerms.length) {
      return this.ourEvents;
    }
    const selectedIds = this.args.selectedTerms.mapBy('id').map(Number);
    return this.ourEvents.filter(event => {
      const allTerms = [].concat(event.sessionTerms || [], event.courseTerms || []).mapBy('id');
      const matchingTerms = allTerms.filter(id => selectedIds.includes(id));
      return matchingTerms.length > 0;
    });
  }

  @action
  removeFilter(filter) {
    if (typeof filter === 'number') {
      this.args.updateCourseLevels(filter);
    } else {
      const model = filter.constructor.modelName;
      const id = filter.id;
      switch (model) {
      case 'session-type':
        this.args.updateSessionTypes(id);
        break;
      case 'cohort':
        this.args.updateCohorts(id);
        break;
      case 'course':
        this.args.updateCourses(id);
        break;
      case 'term':
        this.args.updateTerms(filter);
        break;
      }
    }
  }
}
