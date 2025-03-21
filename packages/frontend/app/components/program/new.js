import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class NewProgramComponent extends Component {
  @service store;

  @tracked title;

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const program = this.store.createRecord('program', {
      title: this.title,
    });
    await this.args.save(program);
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
