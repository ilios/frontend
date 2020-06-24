import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default class DataLoaderService extends Service {
  @service store;
  #calendarSchools = {};
  #coursesSchools = {};
  #learnerGroupSchools = {};
  #learnerGroupCohorts = {};
  #courses = {};
  async loadSchoolForCalendar(id) {
    if (!(id in this.#calendarSchools)) {
      this.#calendarSchools[id] = this.store.findRecord('school', id, {
        include: 'programs.programYears.cohort,sessionTypes,vocabularies.terms,courses',
        reload: true,
      });
    }

    return this.#calendarSchools[id];
  }
}
