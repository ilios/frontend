import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency-decorators';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class CourseHeaderComponent extends Component {
  @Length(3, 200) @NotBlank() @tracked courseTitle;

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
  revertTitleChanges(){
    this.courseTitle = this.args.course.title;
  }
}
