import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty, isPresent } from '@ember/utils';
import { filter } from 'rsvp';
import moment from 'moment';

export default Component.extend({
  store: service(),
  classNames: ['user-profile-permissions', 'large-component'],
  selectedSchoolId: null,
  selectedYearId: null,
  schoolCollapsed: true,
  programCollapsed: true,
  programYearCollapsed: true,
  courseCollapsed: true,
  sessionCollapsed: true,

  schools: computed(function () {
    const store = this.get('store');
    return store.findAll('school');
  }),

  academicYears: computed(function () {
    const store = this.get('store');
    return store.findAll('academic-year');
  }),

  selectedSchool: computed('user.school', 'schools.[]', 'selectedSchoolId', async function () {
    const user = this.get('user');
    const selectedSchoolId = this.get('selectedSchoolId');
    if (selectedSchoolId) {
      const schools = await this.get('schools');
      return schools.findBy('id', selectedSchoolId);
    }

    return user.get('school');
  }),

  selectedYear: computed('academicYears.[]', 'selectedYearId', async function(){
    let years = await this.get('academicYears');
    const selectedYearId = this.get('selectedYearId');
    if(isPresent(selectedYearId)){
      return years.find(year => parseInt(year.get('id'), 10) === parseInt(selectedYearId, 10));
    }
    let currentYear = parseInt(moment().format('YYYY'), 10);
    const currentMonth = parseInt(moment().format('M'), 10);
    if(currentMonth < 6){
      currentYear--;
    }
    let defaultYear = years.find(year => parseInt(year.get('id'), 10) === currentYear);
    if(isEmpty(defaultYear)){
      defaultYear = years.get('lastObject');
    }

    return defaultYear;
  }),

  isDirectingSchool: computed('user.directedSchools.[]', 'selectedSchool', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const user = this.get('user');
    const ids = user.hasMany('directedSchools').ids();
    return ids.includes(selectedSchool.get('id'));
  }),

  isAdministeringSchool: computed('user.administeredSchools.[]', 'selectedSchool', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const user = this.get('user');
    const ids = user.hasMany('administeredSchools').ids();
    return ids.includes(selectedSchool.get('id'));
  }),

  directedPrograms: computed('user.directedPrograms.[]', 'selectedSchool', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const user = this.get('user');
    const directedPrograms = await user.get('directedPrograms');

    return filter(directedPrograms.toArray(), async program => {
      const school = await program.get('school');
      return school === selectedSchool;
    });
  }),

  directedProgramYears: computed('user.programYears.[]', 'selectedSchool', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const user = this.get('user');
    const directedProgramYears = await user.get('programYears');

    return filter(directedProgramYears.toArray(), async programYear => {
      const program = await programYear.get('program');
      const school = await program.get('school');
      return school === selectedSchool;
    });
  }),

  directedCourses: computed('user.directedCourses.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const selectedYear = await this.get('selectedYear');
    const user = this.get('user');
    const directedCourses = await user.get('directedCourses');

    return filter(directedCourses.toArray(), async course => {
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  administeredCourses: computed('user.administeredCourses.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const selectedYear = await this.get('selectedYear');
    const user = this.get('user');
    const administeredCourses = await user.get('administeredCourses');

    return filter(administeredCourses.toArray(), async course => {
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  instructedCourses: computed('user.allInstructedCourses.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const selectedYear = await this.get('selectedYear');
    const user = this.get('user');
    const allInstructedCourses = await user.get('allInstructedCourses');

    return filter(allInstructedCourses.toArray(), async course => {
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  administeredSessions: computed('user.administeredSessions.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const selectedYear = await this.get('selectedYear');
    const user = this.get('user');
    const administeredSessions = await user.get('administeredSessions');

    return filter(administeredSessions.toArray(), async session => {
      const course = await session.get('course');
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  instructedSessions: computed('user.allInstructedSessions.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.get('selectedSchool');
    const selectedYear = await this.get('selectedYear');
    const user = this.get('user');
    const allInstructedSessions = await user.get('allInstructedSessions');

    return filter(allInstructedSessions.toArray(), async session => {
      const course = await session.get('course');
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  courseCount: computed('directedCourses.length', 'administeredCourses.length', 'instructedCourses.length', async function () {
    const directedCourses = await this.get('directedCourses');
    const administeredCourses = await this.get('administeredCourses');
    const instructedCourses = await this.get('instructedCourses');

    return directedCourses.length + administeredCourses.length + instructedCourses.length;
  }),

  sessionCount: computed('administeredSessions.length', 'instructedSessions.length', async function () {
    const administeredSessions = await this.get('administeredSessions');
    const instructedSessions = await this.get('instructedSessions');

    return administeredSessions.length + instructedSessions.length;
  }),

  isLoaded: computed(
    'isDirectingSchool',
    'isAdministeringSchool',
    'directedPrograms',
    'directedProgramYears',
    'directedCourses',
    'administeredCourses',
    'instructedCourses',
    'administeredSessions',
    'instructedSessions',
    async function () {
      await this.get('isDirectingSchool');
      await this.get('isAdministeringSchool');
      await this.get('directedPrograms');
      await this.get('directedProgramYears');
      await this.get('directedCourses');
      await this.get('administeredCourses');
      await this.get('instructedCourses');
      await this.get('administeredSessions');
      await this.get('instructedSessions');
    }
  ),
});
