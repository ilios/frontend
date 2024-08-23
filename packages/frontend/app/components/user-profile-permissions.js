import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class UserProfilePermissionsComponent extends Component {
  @service store;
  @service iliosConfig;

  @tracked programCollapsed = false;
  @tracked programYearCollapsed = false;
  @tracked courseCollapsed = false;
  @tracked sessionCollapsed = false;

  get programExpanded() {
    return !this.programCollapsed;
  }

  get programYearExpanded() {
    return !this.programYearCollapsed;
  }

  get courseExpanded() {
    return !this.courseCollapsed;
  }

  get sessionExpanded() {
    return !this.sessionCollapsed;
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  @cached
  get academicYearData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  @cached
  get defaultSchoolData() {
    return new TrackedAsyncData(this.args.user.school);
  }

  @cached
  get directedSchoolsData() {
    return new TrackedAsyncData(this.args.user.directedSchools);
  }

  @cached
  get administeredSchoolsData() {
    return new TrackedAsyncData(this.args.user.administeredSchools);
  }

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : false;
  }

  get schools() {
    return this.schoolData.isResolved ? this.schoolData.value : [];
  }

  get academicYears() {
    return this.academicYearData.isResolved ? this.academicYearData.value : [];
  }

  @cached
  get defaultSchool() {
    return this.defaultSchoolData.isResolved ? this.defaultSchoolData.value : null;
  }

  @cached
  get isDirectingSchool() {
    if (!this.directedSchoolsData.isResolved) {
      return false;
    }
    return this.directedSchoolsData.value.includes(this.bestSelectedSchool);
  }

  @cached
  get isAdministeringSchool() {
    if (!this.administeredSchoolsData.isResolved) {
      return false;
    }
    return this.administeredSchoolsData.value.includes(this.bestSelectedSchool);
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
    return this._userDirectedProgramsData.isResolved ? this._userDirectedProgramsData.value : [];
  }

  @cached
  get directedProgramsData() {
    return new TrackedAsyncData(
      this.getDirectedPrograms(this.bestSelectedSchool, this._userDirectedPrograms),
    );
  }

  get directedPrograms() {
    return this.directedProgramsData.isResolved ? this.directedProgramsData.value : [];
  }

  @cached
  get _userProgramYearsData() {
    return new TrackedAsyncData(this.args.user.programYears);
  }

  get _userProgramYears() {
    return this._userProgramYearsData.isResolved ? this._userProgramYearsData.value : [];
  }

  @cached
  get directedProgramYearsData() {
    return new TrackedAsyncData(
      this.getDirectedProgramYears(this.bestSelectedSchool, this._userProgramYears),
    );
  }

  get directedProgramYears() {
    return this.directedProgramYearsData.isResolved ? this.directedProgramYearsData.value : [];
  }

  @cached
  get _userDirectedCoursesData() {
    return new TrackedAsyncData(this.args.user.directedCourses);
  }

  get _userDirectedCourses() {
    return this._userDirectedCoursesData.isResolved ? this._userDirectedCoursesData.value : [];
  }

  @cached
  get directedCoursesData() {
    return new TrackedAsyncData(
      this.getDirectedCourses(
        this.bestSelectedSchool,
        this.selectedYearId,
        this._userDirectedCourses,
      ),
    );
  }

  get directedCourses() {
    return this.directedCoursesData.isResolved ? this.directedCoursesData.value : [];
  }

  @cached
  get _userAdministeredCoursesData() {
    return new TrackedAsyncData(this.args.user.administeredCourses);
  }

  get _userAdministeredCourses() {
    return this._userAdministeredCoursesData.isResolved
      ? this._userAdministeredCoursesData.value
      : [];
  }

  @cached
  get administeredCoursesData() {
    return new TrackedAsyncData(
      this.getAdministeredCourses(
        this.bestSelectedSchool,
        this.selectedYearId,
        this._userAdministeredCourses,
      ),
    );
  }

  get administeredCourses() {
    return this.administeredCoursesData.isResolved ? this.administeredCoursesData.value : [];
  }

  @cached
  get instructedCoursesData() {
    return new TrackedAsyncData(
      this.getInstructedCourses(
        this.bestSelectedSchool,
        this.selectedYearId,
        this.args.user.allInstructedCourses,
      ),
    );
  }

  get instructedCourses() {
    return this.instructedCoursesData.isResolved ? this.instructedCoursesData.value : [];
  }

  @cached
  get _userStudentAdvisedCoursesData() {
    return new TrackedAsyncData(this.args.user.studentAdvisedCourses);
  }

  get _userStudentAdvisedCourses() {
    return this._userStudentAdvisedCoursesData.isResolved
      ? this._userStudentAdvisedCoursesData.value
      : [];
  }

  @cached
  get studentAdvisedCoursesData() {
    return new TrackedAsyncData(
      this.getStudentAdvisedCourses(
        this.bestSelectedSchool,
        this.selectedYearId,
        this._userStudentAdvisedCourses,
      ),
    );
  }

  get studentAdvisedCourses() {
    return this.studentAdvisedCoursesData.isResolved ? this.studentAdvisedCoursesData.value : [];
  }

  @cached
  get _userAdministeredSessionsData() {
    return new TrackedAsyncData(this.args.user.administeredSessions);
  }

  get _userAdministeredSessions() {
    return this._userAdministeredSessionsData.isResolved
      ? this._userAdministeredSessionsData.value
      : [];
  }

  @cached
  get administeredSessionsData() {
    return new TrackedAsyncData(
      this.getAdministeredSessions(
        this.bestSelectedSchool,
        this.selectedYearId,
        this._userAdministeredSessions,
      ),
    );
  }

  get administeredSessions() {
    return this.administeredSessionsData.isResolved ? this.administeredSessionsData.value : [];
  }

  @cached
  get instructedSessionsData() {
    return new TrackedAsyncData(
      this.getInstructedSessions(
        this.bestSelectedSchool,
        this.selectedYearId,
        this.args.user.allInstructedSessions,
      ),
    );
  }

  get instructedSessions() {
    return this.instructedSessionsData.isResolved ? this.instructedSessionsData.value : [];
  }

  @cached
  get _userStudentAdvisedSessionsData() {
    return new TrackedAsyncData(this.args.user.studentAdvisedSessions);
  }

  get _userStudentAdvisedSessions() {
    return this._userStudentAdvisedSessionsData.isResolved
      ? this._userStudentAdvisedSessionsData.value
      : [];
  }

  @cached
  get studentAdvisedSessionsData() {
    return new TrackedAsyncData(
      this.getStudentAdvisedSessions(
        this.bestSelectedSchool,
        this.selectedYearId,
        this._userStudentAdvisedSessions,
      ),
    );
  }

  get studentAdvisedSessions() {
    return this.studentAdvisedSessionsData.isResolved ? this.studentAdvisedSessionsData.value : [];
  }

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
      currentYear = DateTime.now().year;
    }
    const currentMonth = DateTime.now().month;
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

  @action
  changeSchool(schoolId) {
    this.resetCollapsers();
    this.args.setSchool(schoolId);
  }

  @action
  changeYear(year) {
    this.resetCollapsers();
    this.args.setYear(year);
  }

  resetCollapsers() {
    this.programCollapsed = false;
    this.programYearCollapsed = false;
    this.courseCollapsed = false;
    this.sessionCollapsed = false;
  }
}
