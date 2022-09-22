import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { filter } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { findById, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class UserProfilePermissionsComponent extends Component {
  @service store;
  @service iliosConfig;

  schoolPromise = this.store.findAll('school');
  academicYearPromise = this.store.findAll('academic-year');

  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    false,
  ]);
  @use _schools = new ResolveAsyncValue(() => [this.schoolPromise]);
  get schools() {
    return this._schools?.slice() ?? [];
  }
  @use _academicYears = new ResolveAsyncValue(() => [this.academicYearPromise]);
  get academicYears() {
    return this._academicYears?.slice() ?? [];
  }
  @use defaultSchool = new ResolveAsyncValue(() => [this.args.user.school]);

  @use _directedSchools = new ResolveAsyncValue(() => [this.args.user.directedSchools]);
  get isDirectingSchool() {
    return this._directedSchools?.includes(this.bestSelectedSchool);
  }

  @use _administeredSchools = new ResolveAsyncValue(() => [this.args.user.administeredSchools]);
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

  @use _userDirectedPrograms = new ResolveAsyncValue(() => [this.args.user.directedPrograms]);
  @use directedPrograms = new AsyncProcess(() => [
    this.getDirectedPrograms.bind(this),
    this.bestSelectedSchool,
    this._userDirectedPrograms?.slice() ?? [],
  ]);
  @use _userProgramYears = new ResolveAsyncValue(() => [this.args.user.programYears]);
  @use directedProgramYears = new AsyncProcess(() => [
    this.getDirectedProgramYears.bind(this),
    this.bestSelectedSchool,
    this._userProgramYears?.slice() ?? [],
  ]);
  @use _userDirectedCourses = new ResolveAsyncValue(() => [this.args.user.directedCourses]);
  @use directedCourses = new AsyncProcess(() => [
    this.getDirectedCourses.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userDirectedCourses?.slice() ?? [],
  ]);
  @use _userAdministeredCourses = new ResolveAsyncValue(() => [this.args.user.administeredCourses]);
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
  @use _userStudentAdvisedCourses = new ResolveAsyncValue(() => [
    this.args.user.studentAdvisedCourses,
  ]);
  @use studentAdvisedCourses = new AsyncProcess(() => [
    this.getStudentAdvisedCourses.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userStudentAdvisedCourses?.slice() ?? [],
  ]);
  @use _userAdministeredSessions = new ResolveAsyncValue(() => [
    this.args.user.administeredSessions,
  ]);
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
  @use _userStudentAdvisedSessions = new ResolveAsyncValue(() => [
    this.args.user.studentAdvisedSessions,
  ]);
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
