import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isBlank, isEmpty, isPresent } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import moment from 'moment';

export default Controller.extend({
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),
  dataLoader: service(),
  iliosConfig: service(),

  queryParams: {
    schoolId: 'school',
    sortCoursesBy: 'sortBy',
    titleFilter: 'filter',
    year: 'year',
    userCoursesOnly: 'mycourses',
  },

  deletedCourse: null,
  newCourse: null,
  schoolId: null,
  showNewCourseForm: false,
  sortCoursesBy: 'title',
  sortSchoolsBy: null,
  sortYearsBy: null,
  titleFilter: null,
  userCoursesOnly: false,
  year: null,

  hasMoreThanOneSchool: gt('model.schools.length', 1),

  courses: computed(
    'selectedSchool',
    'selectedYear',
    'deletedCourse',
    'newCourse',
    async function () {
      const selectedSchool = this.selectedSchool;
      const selectedYear = await this.selectedYear;
      if (isEmpty(selectedSchool) || isEmpty(selectedYear)) {
        return [];
      }

      const year = parseInt(selectedYear.id, 10);
      await this.dataLoader.loadSchoolForCourses(selectedSchool.id);
      const courses = await selectedSchool.courses;
      return courses.filter((course) => {
        return course.year === year && !course.archived;
      });
    }
  ),

  userModel: computed('currentUser.currentUserId', async function () {
    return this.currentUser.getModel();
  }),

  allRelatedCourses: computed('userModel.allRelatedCourses.[]', async function () {
    const user = await this.userModel;
    return await user.allRelatedCourses;
  }),

  filteredCourses: computed(
    'titleFilter',
    'courses.[]',
    'userCoursesOnly',
    'allRelatedCourses.[]',
    async function () {
      const titleFilter = this.titleFilter;
      const title = isBlank(titleFilter) ? '' : titleFilter.trim().toLowerCase();
      const filterMyCourses = this.userCoursesOnly;
      const courses = await this.courses;
      let filteredCourses;
      if (isEmpty(title)) {
        filteredCourses = courses.sortBy('title');
      } else {
        filteredCourses = courses
          .filter((course) => {
            return (
              (isPresent(course.title) && course.title.trim().toLowerCase().includes(title)) ||
              (isPresent(course.externalId) &&
                course.externalId.trim().toLowerCase().includes(title))
            );
          })
          .sortBy('title');
      }
      if (filterMyCourses) {
        const allRelatedCourses = await this.allRelatedCourses;
        filteredCourses = filteredCourses.filter((course) => allRelatedCourses.includes(course));
      }
      return filteredCourses;
    }
  ),

  selectedSchool: computed(
    'model.{primarySchool,schools.[]}',
    'primarySchool',
    'schoolId',
    function () {
      const schools = this.model.schools;
      const primarySchool = this.model.primarySchool;
      const schoolId = this.schoolId;
      if (isPresent(schoolId)) {
        const school = schools.findBy('id', schoolId);
        if (school) {
          return school;
        }
      }

      return primarySchool;
    }
  ),

  selectedYear: computed('model.years.[]', 'year', async function () {
    const years = this.model.years;
    if (isPresent(this.year)) {
      return years.find((year) => year.id === this.year);
    }
    let currentYear = parseInt(moment().format('YYYY'), 10);
    const currentMonth = parseInt(moment().format('M'), 10);
    const academicYearIsCrossingYearBoundaries = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    if (academicYearIsCrossingYearBoundaries && currentMonth < 6) {
      currentYear--;
    }
    let defaultYear = years.find((year) => parseInt(year.id, 10) === currentYear);
    if (isEmpty(defaultYear)) {
      defaultYear = years.lastObject;
    }

    return defaultYear;
  }),

  canCreateCourse: computed('selectedSchool', async function () {
    const permissionChecker = this.permissionChecker;
    const selectedSchool = this.selectedSchool;
    return permissionChecker.canCreateCourse(selectedSchool);
  }),

  actions: {
    async removeCourse(course) {
      const school = await this.selectedSchool;
      const courses = await school.courses;
      courses.removeObject(course);
      await course.destroyRecord();
      this.set('deletedCourse', course);
      const newCourse = this.newCourse;
      if (newCourse === course) {
        this.set('newCourse', null);
      }
    },

    async saveNewCourse(newCourse) {
      newCourse.setDatesBasedOnYear();
      const savedCourse = await newCourse.save();
      this.set('showNewCourseForm', false);
      this.set('newCourse', savedCourse);
      const school = await this.selectedSchool;
      const courses = await school.courses;
      courses.pushObject(savedCourse);
      return savedCourse;
    },

    changeSelectedYear(year) {
      this.set('year', year);
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },

    toggleNewCourseForm() {
      this.set('showNewCourseForm', !this.showNewCourseForm);
    },

    lockCourse(course) {
      course.set('locked', true);
      return course.save();
    },

    unlockCourse(course) {
      course.set('locked', false);
      return course.save();
    },
  },

  changeTitleFilter: task(function* (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),
});
