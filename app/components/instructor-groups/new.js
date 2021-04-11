import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class instructorGroupsNewComponent extends Component {
  @service store;
  @tracked @Length(3, 60) @NotBlank() title;

  @dropTask
  *save() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    const instructorGroup = this.store.createRecord('instructor-group', {
      title: this.title,
      school: this.args.currentSchool,
    });
    yield this.args.save(instructorGroup);
  }

  @action
  async keyboard({ keyCode }) {
    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.args.cancel();
    }
  }
}
