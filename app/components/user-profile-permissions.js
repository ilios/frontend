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
    const store = this.store;
    return store.findAll('school');
  }),

  academicYears: computed(function () {
    const store = this.store;
    return store.findAll('academic-year');
  }),

  selectedSchool: computed('user.school', 'schools.[]', 'selectedSchoolId', async function () {
    const user = this.user;
    const selectedSchoolId = this.selectedSchoolId;
    if (selectedSchoolId) {
      const schools = await this.schools;
      return schools.findBy('id', selectedSchoolId);
    }

    return user.get('school');
  }),

  selectedYear: computed('academicYears.[]', 'selectedYearId', async function(){
    let years = await this.academicYears;
    const selectedYearId = this.selectedYearId;
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
    const selectedSchool = await this.selectedSchool;
    const user = this.user;
    const ids = user.hasMany('directedSchools').ids();
    return ids.includes(selectedSchool.get('id'));
  }),

  isAdministeringSchool: computed('user.administeredSchools.[]', 'selectedSchool', async function () {
    const selectedSchool = await this.selectedSchool;
    const user = this.user;
    const ids = user.hasMany('administeredSchools').ids();
    return ids.includes(selectedSchool.get('id'));
  }),

  directedPrograms: computed('user.directedPrograms.[]', 'selectedSchool', async function () {
    const selectedSchool = await this.selectedSchool;
    const user = this.user;
    const directedPrograms = await user.get('directedPrograms');

    return filter(directedPrograms.toArray(), async program => {
      const school = await program.get('school');
      return school === selectedSchool;
    });
  }),

  directedProgramYears: computed('user.programYears.[]', 'selectedSchool', async function () {
    const selectedSchool = await this.selectedSchool;
    const user = this.user;
    const directedProgramYears = await user.get('programYears');

    return filter(directedProgramYears.toArray(), async programYear => {
      const program = await programYear.get('program');
      const school = await program.get('school');
      return school === selectedSchool;
    });
  }),

  directedCourses: computed('user.directedCourses.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.selectedSchool;
    const selectedYear = await this.selectedYear;
    const user = this.user;
    const directedCourses = await user.get('directedCourses');

    return filter(directedCourses.toArray(), async course => {
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  administeredCourses: computed('user.administeredCourses.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.selectedSchool;
    const selectedYear = await this.selectedYear;
    const user = this.user;
    const administeredCourses = await user.get('administeredCourses');

    return filter(administeredCourses.toArray(), async course => {
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  instructedCourses: computed('user.allInstructedCourses.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.selectedSchool;
    const selectedYear = await this.selectedYear;
    const user = this.user;
    const allInstructedCourses = await user.get('allInstructedCourses');

    return filter(allInstructedCourses.toArray(), async course => {
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  administeredSessions: computed('user.administeredSessions.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.selectedSchool;
    const selectedYear = await this.selectedYear;
    const user = this.user;
    const administeredSessions = await user.get('administeredSessions');

    return filter(administeredSessions.toArray(), async session => {
      const course = await session.get('course');
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  instructedSessions: computed('user.allInstructedSessions.[]', 'selectedSchool', 'selectedYear', async function () {
    const selectedSchool = await this.selectedSchool;
    const selectedYear = await this.selectedYear;
    const user = this.user;
    const allInstructedSessions = await user.get('allInstructedSessions');

    return filter(allInstructedSessions.toArray(), async session => {
      const course = await session.get('course');
      const school = await course.get('school');
      return (school === selectedSchool && selectedYear.get('id') == course.get('year'));
    });
  }),

  courseCount: computed('directedCourses.length', 'administeredCourses.length', 'instructedCourses.length', async function () {
    const directedCourses = await this.directedCourses;
    const administeredCourses = await this.administeredCourses;
    const instructedCourses = await this.instructedCourses;

    return directedCourses.length + administeredCourses.length + instructedCourses.length;
  }),

  sessionCount: computed('administeredSessions.length', 'instructedSessions.length', async function () {
    const administeredSessions = await this.administeredSessions;
    const instructedSessions = await this.instructedSessions;

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
      await this.isDirectingSchool;
      await this.isAdministeringSchool;
      await this.directedPrograms;
      await this.directedProgramYears;
      await this.directedCourses;
      await this.administeredCourses;
      await this.instructedCourses;
      await this.administeredSessions;
      await this.instructedSessions;
    }
  ),
});
