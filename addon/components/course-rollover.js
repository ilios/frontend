import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import moment from 'moment';

@validatable
export default class CourseRolloverComponent extends Component {
  @service fetch;
  @service store;
  @service flashMessages;
  @service iliosConfig;

  @Length(3, 200) @NotBlank() @tracked title;
  @NotBlank() @tracked selectedYear;
  @tracked years;
  @tracked course;
  @tracked startDate;
  @tracked skipOfferings = false;
  @tracked allCourses;
  @tracked selectedCohorts = [];
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  constructor() {
    super(...arguments);
    const lastYear = Number(moment().subtract(1, 'year').format('YYYY'));
    this.years = [];
    for (let i = 0; i < 6; i++) {
      this.years.push(lastYear + i);
    }
  }

  @restartableTask
  *load(event, [course]) {
    if (!course) {
      return;
    }
    this.title = course.title;
    const school = course.belongsTo('school').id();
    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    this.allCourses = yield this.store.query('course', {
      filters: {
        school,
      },
    });
    this.changeSelectedYear(this.years.firstObject);
  }

  @action
  changeTitle(newTitle) {
    this.title = newTitle;
  }
  @action
  addCohort(cohort) {
    this.selectedCohorts = [...this.selectedCohorts, cohort];
  }
  @action
  removeCohort(cohort) {
    this.selectedCohorts = this.selectedCohorts.filter((obj) => obj !== cohort);
  }

  @dropTask
  *save() {
    yield timeout(1);
    this.addErrorDisplayForAllFields();
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    const courseId = this.args.course.id;

    const selectedCohortIds = this.selectedCohorts.mapBy('id');

    const data = {
      year: this.selectedYear,
      newCourseTitle: this.title,
    };
    if (this.startDate) {
      data.newStartDate = moment(this.startDate).format('YYYY-MM-DD');
    }
    if (this.skipOfferings) {
      data.skipOfferings = true;
    }
    if (selectedCohortIds && selectedCohortIds.length) {
      data.newCohorts = selectedCohortIds;
    }

    const newCoursesObj = yield this.fetch.postQueryToApi(`courses/${courseId}/rollover`, data);

    this.flashMessages.success('general.courseRolloverSuccess');
    this.store.pushPayload(newCoursesObj);
    const newCourse = this.store.peekRecord('course', newCoursesObj.data.id);

    return this.args.visit(newCourse);
  }

  get unavailableYears() {
    if (!this.allCourses) {
      return [];
    }
    const existingCoursesWithTitle = this.allCourses.filterBy('title', this.title.trim());
    return existingCoursesWithTitle.mapBy('year');
  }

  @action
  setSelectedYear(event) {
    this.changeSelectedYear(event.target.value);
  }

  @action
  changeSelectedYear(selectedYear) {
    this.selectedYear = Number(selectedYear);

    const date = moment(this.args.course.startDate);
    const day = date.isoWeekday();
    const week = date.isoWeek();

    this.startDate = moment()
      .hour(0)
      .minute(0)
      .year(selectedYear)
      .isoWeek(week)
      .isoWeekday(day)
      .toDate();
  }
}
