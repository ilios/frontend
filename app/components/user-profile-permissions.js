import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { filter } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class UserProfilePermissionsComponent extends Component {
  @service store;
  @service iliosConfig;

  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    false,
  ]);
  @use _schools = new ResolveAsyncValue(() => [this.store.findAll('school')]);
  get schools() {
    return this._schools?.toArray() ?? [];
  }
  @use _academicYears = new ResolveAsyncValue(() => [this.store.findAll('academic-year')]);
  get academicYears() {
    return this._academicYears?.toArray() ?? [];
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
    this._userDirectedPrograms?.toArray() ?? [],
  ]);
  @use _userProgramYears = new ResolveAsyncValue(() => [this.args.user.programYears]);
  @use directedProgramYears = new AsyncProcess(() => [
    this.getDirectedProgramYears.bind(this),
    this.bestSelectedSchool,
    this._userProgramYears?.toArray() ?? [],
  ]);
  @use _userDirectedCourses = new ResolveAsyncValue(() => [this.args.user.directedCourses]);
  @use directedCourses = new AsyncProcess(() => [
    this.getDirectedCourses.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userDirectedCourses?.toArray() ?? [],
  ]);
  @use _userAdministeredCourses = new ResolveAsyncValue(() => [this.args.user.administeredCourses]);
  @use administeredCourses = new AsyncProcess(() => [
    this.getAdministeredCourses.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userAdministeredCourses?.toArray() ?? [],
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
    this._userStudentAdvisedCourses?.toArray() ?? [],
  ]);
  @use _userAdministeredSessions = new ResolveAsyncValue(() => [
    this.args.user.administeredSessions,
  ]);
  @use administeredSessions = new AsyncProcess(() => [
    this.getAdministeredSessions.bind(this),
    this.bestSelectedSchool,
    this.selectedYearId,
    this._userAdministeredSessions?.toArray() ?? [],
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
    this._userStudentAdvisedSessions?.toArray() ?? [],
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
    return filter(allInstructedCourses ?? [], async (course) => {
      const school = await course.school;
      return school === selectedSchool && selectedYearId === course.year.toString();
    });
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
      selectedYear = this.academicYears.get('lastObject');
    }
    return selectedYear;
  }

  get bestSelectedSchool() {
    if (this.args.selectedSchoolId) {
      return this.schools.findBy('id', this.args.selectedSchoolId);
    } else if (this.defaultSchool) {
      return this.defaultSchool;
    } else if (this.schools.length) {
      return this.schools.sortBy('title')[0];
    }

    return null;
  }
}
