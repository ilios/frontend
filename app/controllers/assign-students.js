import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { gt, reads } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';

const DEBOUNCE_DELAY = 250;

export default Controller.extend({
  store: service(),

  queryParams: ['query', 'schoolId'],

  query: '',
  schoolId: null,

  hasMoreThanOneSchool: gt('model.schools.length', 1),
  primarySchool: reads('model.primarySchool'),
  schools: reads('model.schools'),

  selectedSchool: computed('primarySchool', 'schoolId', 'schools.[]', function() {
    const primarySchool = this.primarySchool;
    const schoolId = this.schoolId;

    if (isPresent(schoolId)){
      const school = this.schools.findBy('id', schoolId);
      return school ? school : primarySchool;
    } else {
      return primarySchool;
    }
  }),

  unassignedStudents: computed('selectedSchool', async function() {
    const filters = {
      cohorts: null,
      enabled: true,
      school: this.schoolId,
      roles: [4]
    };
    return await this.store.query('user', { filters });
  }),

  filteredUnassignedStudents: computed(
    'query', 'unassignedStudents', async function() {
      const query = this.query;
      const students = await this.unassignedStudents;
      const sortedStudents = students.sortBy('lastName', 'firstName');
      return isPresent(query)
        ? this.filterStudents(sortedStudents, query)
        : sortedStudents;
    }
  ),

  setQuery: task(function* (q) {
    yield timeout(DEBOUNCE_DELAY);
    this.set('query', q);
  }).restartable(),

  filterStudents(students, query) {
    return students.filter((student) => {
      const regex = new RegExp(query, "i");
      return student.fullName.search(regex) > -1;
    });
  }
});
