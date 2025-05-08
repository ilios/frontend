import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class CourseHeaderComponent extends Component {
  @service iliosConfig;

  @Length(3, 200) @NotBlank() @tracked courseTitle;
  @tracked isEditingTitle = false;

  constructor() {
    super(...arguments);
    this.courseTitle = this.args.course.title;
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

  changeTitle = restartableTask(async () => {
    this.courseTitle = this.courseTitle.trim();
    this.addErrorDisplayFor('courseTitle');
    const isValid = await this.isValid('courseTitle');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('courseTitle');
    this.args.course.set('title', this.courseTitle);
    await this.args.course.save();
  });

  @action
  revertTitleChanges() {
    this.courseTitle = this.args.course.title;
  }
}
