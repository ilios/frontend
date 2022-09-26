import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';

@validatable
export default class SchoolManagerComponent extends Component {
  @service flashMessages;
  @tracked @NotBlank() @Length(1, 60) title;

  @action
  load() {
    this.title = this.args.school.title;
  }

  changeTitle = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');

    this.args.school.title = this.title;
    this.newSchool = await this.args.school.save();
    this.flashMessages.success('general.savedSuccessfully');
  });

  @action
  revertTitleChanges() {
    this.title = this.args.school.title;
  }

  @action
  async saveInstitution(institution) {
    if (!institution.belongsTo('school').id()) {
      institution.school = this.args.school;
    }
    await institution.save();
  }
}
