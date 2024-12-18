import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { restartableTask } from 'ember-concurrency';

export default class SessionHeaderComponent extends Component {
  @tracked title;

  constructor() {
    super(...arguments);
    this.resetTitle();
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  changeTitle = restartableTask(async () => {
    this.validations.addErrorDisplayFor('title');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }

    this.validations.removeErrorDisplayFor('title');
    this.args.session.title = this.title;
    await this.args.session.save();
  });

  resetTitle = () => {
    this.title = this.args.session.title;
  };
}
