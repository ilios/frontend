import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class NewCompetencyComponent extends Component {
  @tracked title;

  validations = new YupValidations(this, {
    title: string().required().max(200),
  });

  cancelOrSave = dropTask(async (event) => {
    const keyCode = event.keyCode;

    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.validations.removeErrorDisplayFor('title');
      this.title = null;
    }
  });

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    const title = this.title;
    await this.args.add(title);
    this.validations.clearErrorDisplay();
    this.title = null;
  });
}
