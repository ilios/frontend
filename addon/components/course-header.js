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

  @restartableTask
  *load() {
    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
    this.revertTitleChanges();
  }

  @restartableTask
  *changeTitle() {
    this.courseTitle = this.courseTitle.trim();
    this.addErrorDisplayFor('courseTitle');
    const isValid = yield this.isValid('courseTitle');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('courseTitle');
    this.args.course.set('title', this.courseTitle);
    yield this.args.course.save();
  }
  @action
  revertTitleChanges() {
    this.courseTitle = this.args.course.title;
  }
}
