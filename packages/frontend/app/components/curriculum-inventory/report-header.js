import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class CurriculumInventoryReportHeaderComponent extends Component {
  @tracked name;

  constructor() {
    super(...arguments);
    this.name = this.args.report.name;
  }

  validations = new YupValidations(this, {
    name: string().trim().required().max(60),
  });

  saveName = restartableTask(async () => {
    this.validations.addErrorDisplayFor('name');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay('name');
    this.args.report.set('name', this.name);
    await this.args.report.save();
    this.name = this.args.report.name;
  });

  @action
  revertNameChanges() {
    this.validations.clearErrorDisplay('name');
    this.name = this.args.report.name;
  }
}
