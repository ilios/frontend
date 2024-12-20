import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask, timeout } from 'ember-concurrency';
import { DateTime } from 'luxon';
import { filterBy, mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

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
  @tracked selectedCohorts = [];

  constructor() {
    super(...arguments);
    const currentYear = DateTime.now().year;
    this.years = [];
    for (let i = 0; i < 6; i++) {
      this.years.push(currentYear + i);
    }
    this.title = this.args.course.title;
  }

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  @cached
  get allCoursesData() {
    return new TrackedAsyncData(
      this.store.query('course', {
        filters: { school: this.school },
      }),
    );
  }

  get allCourses() {
    return this.allCoursesData.isResolved ? this.allCoursesData.value : null;
  }

  get school() {
    return this.args.course.belongsTo('school').id();
  }

  @action
  async loadValidYear() {
    await this.allCourses;
    const validYear = this.years.find((year) => !this.unavailableYears.includes(year));
    this.changeSelectedYear(validYear || this.years[0]);
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

  save = dropTask(async () => {
    await timeout(1);
    this.addErrorDisplayForAllFields();
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    const courseId = this.args.course.id;

    const selectedCohortIds = mapBy(this.selectedCohorts, 'id');

    const data = {
      year: this.selectedYear,
      newCourseTitle: this.title,
    };
    if (this.startDate) {
      data.newStartDate = DateTime.fromJSDate(this.startDate).toFormat('yyyy-LL-dd');
    }
    if (this.skipOfferings) {
      data.skipOfferings = true;
    }
    if (selectedCohortIds && selectedCohortIds.length) {
      data.newCohorts = selectedCohortIds;
    }

    const newCoursesObj = await this.fetch.postQueryToApi(`courses/${courseId}/rollover`, data);

    this.flashMessages.success('general.courseRolloverSuccess');
    this.store.pushPayload(newCoursesObj);
    const newCourse = this.store.peekRecord('course', newCoursesObj.data.id);

    return this.args.visit(newCourse);
  });

  get unavailableYears() {
    if (!this.allCourses) {
      return [];
    }
    const existingCoursesWithTitle = filterBy(this.allCourses, 'title', this.title.trim());
    return mapBy(existingCoursesWithTitle, 'year');
  }

  @action
  setSelectedYear(event) {
    this.changeSelectedYear(event.target.value);
  }

  @action
  changeSelectedYear(selectedYear) {
    this.selectedYear = Number(selectedYear);

    const from = DateTime.fromJSDate(this.args.course.startDate);

    this.startDate = DateTime.fromObject({
      hour: 0,
      minute: 0,
      weekYear: Number(selectedYear),
      weekNumber: from.weekNumber,
      weekday: from.weekday,
    }).toJSDate();
  }
}
