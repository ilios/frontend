import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class CompetencyTitleEditorComponent extends Component {
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.competency.title;
  }

  validations = new YupValidations(this, {
    title: string().required().max(200),
  });

  @action
  revert() {
    this.title = this.args.competency.title;
  }

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.args.competency.title = this.title;
    this.validations.clearErrorDisplay();
  });
}
