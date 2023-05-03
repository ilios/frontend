import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { filter } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { findById, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class UserProfilePermissionsComponent extends Component {
  @service store;
  @service iliosConfig;

  schoolPromise = this.store.findAll('school');
  academicYearPromise = this.store.findAll('academic-year');

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries')
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  @cached
  get _schoolsData() {
    return new TrackedAsyncData(this.schoolPromise);
  }

  get _schools() {
    return this._schoolsData.isResolved ? this._schoolsData.value : null;
  }

  get schools() {
    return this._schools?.slice() ?? [];
  }

  @cached
  get _academicYearsData() {
    return new TrackedAsyncData(this.academicYearPromise);
  }

  get _academicYears() {
    return this._academicYearsData.isResolved ? this._academicYearsData.value : null;
  }

  get academicYears() {
    return this._academicYears?.slice() ?? [];
  }

  @cached
  get defaultSchoolData() {
    return new TrackedAsyncData(this.args.user.school);
  }

  get defaultSchool() {
    return this.defaultSchoolData.isResolved ? this.defaultSchoolData.value : null;
  }

  @cached
  get _directedSchoolsData() {
    return new TrackedAsyncData(this.args.user.directedSchools);
  }

  get _directedSchools() {
    return this._directedSchoolsData.isResolved ? this._directedSchoolsData.value : null;
  }

  get isDirectingSchool() {
    return this._directedSchools?.includes(this.bestSelectedSchool);
  }

  @cached
  get _administeredSchoolsData() {
    return new TrackedAsyncData(this.args.user.administeredSchools);
  }

  get _administeredSchools() {
    return this._administeredSchoolsData.isResolved ? this._administeredSchoolsData.value : null;
  }

  get isAdministeringSchool() {
    return this._administeredSchools?.includes(this.bestSelectedSchool);
  }

  get isLoaded() {
    return !!this.bestSelectedSchool && !!this.selectedYearId;
  }

  get courseCount() {
    if (
      !this.directedCourses ||
      !this.administeredCourses ||
      !this.instructedCourses ||
      !this.studentAdvisedCourses
    ) {
      return 0;
    }
    return (
      this.directedCourses.length +
      this.administeredCourses.length +
      this.instructedCourses.length +
      this.studentAdvisedCourses.length
    );
  }

  get sessionCount() {
    if (!this.administeredSessions || !this.instructedSessions || !this.studentAdvisedSessions) {
      return 0;
    }
    return (
      this.administeredSessions.length +
      this.instructedSessions.length +
      this.studentAdvisedSessions.length
    );
  }

  get selectedYearId() {
    return this.bestSelectedYear?.id;
  }

  @cached
  get _userDirectedProgramsData() {
    return new TrackedAsyncData(this.args.user.directedPrograms);
  }

  get _userDirectedPrograms() {
    return this._userDirectedProgramsData.isResolved ? this._userDirectedProgramsData.value : null;
  }

  @use directedPrograms = new AsyncProcess(() => [
    this.getDirectedPrograms.bind(this),
    this.bestSelectedSchool,
    this._userDirectedPrograms?.slice() ?? [],
  ]);

  @cached
  get _userProgramYearsData() {
    return new TrackedAsyncData(this.args.user.programYears);
  }

  get _userProgramYears() {
    return this._userProgramYearsData.isResolved ? this._userProgramYearsData.value : null;
  }

  @use directedProgramYears = new AsyncProcess(() => [
    this.getDirectedProgramYears.bind(this),
    this.bestSelectedSchool,
    this._userProgramYears?.slice() ?? [],
  ]);

  @cached
  get _userDirectedCoursesData() {
    return new TrackedAsyncData(this.args.user.directedCourses);
  }

  get _userDirectedCourses() {
    return this._userDirectedCoursesData.isResolved ? this._userDirectedCoursesData.value : null;
  }

  @use directedCourses = new AsyncProcess(() => [
    this.getDirectedCourses.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userDirectedCourses?.slice() ?? [],
  ]);

  @cached
  get _userAdministeredCoursesData() {
    return new TrackedAsyncData(this.args.user.administeredCourses);
  }

  get _userAdministeredCourses() {
    return this._userAdministeredCoursesData.isResolved
      ? this._userAdministeredCoursesData.value
      : null;
  }

  @use administeredCourses = new AsyncProcess(() => [
    this.getAdministeredCourses.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userAdministeredCourses?.slice() ?? [],
  ]);
  @use instructedCourses = new AsyncProcess(() => [
    this.getInstructedCourses.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this.args.user.allInstructedCourses,
  ]);

  @cached
  get _userStudentAdvisedCoursesData() {
    return new TrackedAsyncData(this.args.user.studentAdvisedCourses);
  }

  get _userStudentAdvisedCourses() {
    return this._userStudentAdvisedCoursesData.isResolved
      ? this._userStudentAdvisedCoursesData.value
      : null;
  }

  @use studentAdvisedCourses = new AsyncProcess(() => [
    this.getStudentAdvisedCourses.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userStudentAdvisedCourses?.slice() ?? [],
  ]);

  @cached
  get _userAdministeredSessionsData() {
    return new TrackedAsyncData(this.args.user.administeredSessions);
  }

  get _userAdministeredSessions() {
    return this._userAdministeredSessionsData.isResolved
      ? this._userAdministeredSessionsData.value
      : null;
  }

  @use administeredSessions = new AsyncProcess(() => [
    this.getAdministeredSessions.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userAdministeredSessions?.slice() ?? [],
  ]);
  @use instructedSessions = new AsyncProcess(() => [
    this.getInstructedSessions.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this.args.user.allInstructedSessions,
  ]);

  @cached
  get _userStudentAdvisedSessionsData() {
    return new TrackedAsyncData(this.args.user.studentAdvisedSessions);
  }

  get _userStudentAdvisedSessions() {
    return this._userStudentAdvisedSessionsData.isResolved
      ? this._userStudentAdvisedSessionsData.value
      : null;
  }

  @use studentAdvisedSessions = new AsyncProcess(() => [
    this.getStudentAdvisedSessions.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userStudentAdvisedSessions?.slice() ?? [],
  ]);

  async getDirectedPrograms(selectedSchool, directedPrograms) {
    return filter(directedPrograms, async (program) => {
      const school = await program.school;
      return school === selectedSchool;
    });
  }

  async getDirectedProgramYears(selectedSchool, directedProgramYears) {
    return filter(directedProgramYears, async (programYear) => {
      const program = await programYear.program;
      const school = await program.school;
      return school === selectedSchool;
    });
  }

  async getDirectedCourses(selectedSchool, selectedYearId, directedCourses) {
    return filter(directedCourses, async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getAdministeredCourses(selectedSchool, selectedYearId, administeredCourses) {
    return filter(administeredCourses, async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getInstructedCourses(selectedSchool, selectedYearId, allInstructedCourses) {
    const rhett = await filter(allInstructedCourses ?? [], async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
    return uniqueValues(rhett);
  }

  async getStudentAdvisedCourses(selectedSchool, selectedYearId, studentAdvisedCourses) {
    return filter(studentAdvisedCourses, async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getAdministeredSessions(selectedSchool, selectedYearId, administeredSessions) {
    return filter(administeredSessions, async (session) => {
      const course = await session.course;
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getInstructedSessions(selectedSchool, selectedYearId, allInstructedSessions) {
    return filter(allInstructedSessions, async (session) => {
      const course = await session.course;
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  async getStudentAdvisedSessions(selectedSchool, selectedYearId, studentAdvisedSessions) {
    return filter(studentAdvisedSessions, async (session) => {
      const course = await session.course;
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
  }

  get bestSelectedYear() {
    let currentYear;
    if (this.args.selectedYearId) {
      currentYear = Number(this.args.selectedYearId);
    } else {
      currentYear = Number(moment().format('YYYY'));
    }
    const currentMonth = Number(moment().format('M'));
    if (this.academicYearCrossesCalendarYearBoundaries && currentMonth < 6) {
      currentYear--;
    }
    let selectedYear = this.academicYears.find((year) => Number(year.id) === currentYear);
    if (!selectedYear) {
      selectedYear = this.academicYears.reverse()[0];
    }
    return selectedYear;
  }

  get bestSelectedSchool() {
    if (this.args.selectedSchoolId) {
      return findById(this.schools, this.args.selectedSchoolId);
    } else if (this.defaultSchool) {
      return this.defaultSchool;
    } else if (this.schools.length) {
      return sortBy(this.schools, 'title')[0];
    }
    return null;
  }
}
