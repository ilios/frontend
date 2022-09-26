import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask, restartableTask } from 'ember-concurrency';

@validatable
export default class NewCourseComponent extends Component {
  @service intl;
  @service store;
  @service iliosConfig;

  @tracked @NotBlank() selectedYear;
  @tracked @NotBlank() @Length(3, 200) title;
  @tracked academicYearCrossesCalendarYearBoundaries;
  @tracked years;

  constructor() {
    super(...arguments);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    this.years = [thisYear - 2, thisYear - 1, thisYear, thisYear + 1, thisYear + 2];
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

  load = restartableTask(async () => {
    this.academicYearCrossesCalendarYearBoundaries = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    if (this.args.currentYear && this.years.includes(parseInt(this.args.currentYear.id, 10))) {
      this.setYear(this.args.currentYear.id);
    }
  });

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
