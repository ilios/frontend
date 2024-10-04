import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class CoursesNewComponent extends Component {
  @service intl;
  @service store;
  @service iliosConfig;

  @tracked @NotBlank() selectedYear;
  @tracked @NotBlank() @Length(3, 200) title;
  @tracked academicYearCrossesCalendarYearBoundaries;
  @tracked years;

  constructor() {
    super(...arguments);
    const thisYear = DateTime.now().year;
    this.years = [thisYear - 2, thisYear - 1, thisYear, thisYear + 1, thisYear + 2];

    if (this.args.currentYear && this.years.includes(parseInt(this.args.currentYear.id, 10))) {
      this.setYear(this.args.currentYear.id);
    }
  }

  @cached
  get academicYearData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  @action
  setYear(year) {
    this.selectedYear = parseInt(year, 10);
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
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    const course = this.store.createRecord('course', {
      level: 1,
      title: this.title,
      school: this.args.currentSchool,
      year: this.selectedYear,
    });
    await this.args.save(course);
  });
}
