import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class LearnerGroupNewSingleComponent extends Component {
  @tracked title;
  @tracked fillWithCohort = false;

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
    return this.args.save(this.title, this.fillWithCohort);
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
