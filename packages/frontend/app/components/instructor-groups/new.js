import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class InstructorGroupsNewComponent extends Component {
  @service store;
  @tracked title;

  validations = new YupValidations(this, {
    title: string().required().min(3).max(60),
  });

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const instructorGroup = this.store.createRecord('instructor-group', {
      title: this.title,
    });
    await this.args.save(instructorGroup);
  });

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
