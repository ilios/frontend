import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class ProgramHeaderComponent extends Component {
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.program.title;
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  changeTitle = dropTask(async () => {
    if (this.title !== this.args.program.title) {
      this.validations.addErrorDisplayForAllFields();
      const isValid = await this.validations.isValid();
      if (!isValid) {
        return false;
      }
      this.args.program.set('title', this.title);
      await this.args.program.save();
      this.title = this.args.program.title;
      this.validations.clearErrorDisplay();
    }
  });
}
