import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { number, string } from 'yup';

export default class CoursesNewComponent extends Component {
  @service intl;
  @service store;
  @service iliosConfig;

  @tracked selectedYear;
  @tracked title;
  @tracked years;

  constructor() {
    super(...arguments);
    const thisYear = DateTime.now().year;
    this.years = [thisYear - 2, thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

    if (this.args.currentYear && this.years.includes(Number(this.args.currentYear.id))) {
      this.setYear(this.args.currentYear.id);
    }
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
    selectedYear: number().required(),
  });

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

  @action
  setYear(year) {
    this.selectedYear = Number(year);
  }

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }
    if (13 === keyCode) {
      this.saveCourse.perform();
      return;
    }
    if (27 === keyCode) {
      this.args.cancel();
    }
  }

  saveCourse = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const course = this.store.createRecord('course', {
      level: 1,
      title: this.title,
      school: this.args.currentSchool,
      year: this.selectedYear,
    });
    await this.args.save(course);
  });
}
