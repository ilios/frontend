import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { inject as service } from '@ember/service';

@validatable
export default class CourseHeaderComponent extends Component {
  @service iliosConfig;

  @Length(3, 200) @NotBlank() @tracked courseTitle;
  @tracked isEditingTitle = false;
  @tracked academicYearCrossesCalendarYearBoundaries = false;

  load = restartableTask(async () => {
    this.academicYearCrossesCalendarYearBoundaries = await this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    this.revertTitleChanges();
  });

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
