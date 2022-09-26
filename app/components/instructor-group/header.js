import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';

@validatable
export default class InstructorGroupHeaderComponent extends Component {
  @service store;
  @tracked @NotBlank() @Length(3, 60) title;

  @action
  load() {
    this.title = this.args.instructorGroup.title;
  }

  changeTitle = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.instructorGroup.title = this.title;
    await this.args.instructorGroup.save();
    this.title = this.args.instructorGroup.title;
  });

  @action
  revertTitleChanges() {
    this.title = this.args.instructorGroup.title;
  }
}
