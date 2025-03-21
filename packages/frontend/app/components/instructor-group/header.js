import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class InstructorGroupHeaderComponent extends Component {
  @service store;
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.instructorGroup.title;
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(60),
  });

  changeTitle = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    this.args.instructorGroup.title = this.title;
    await this.args.instructorGroup.save();
    this.title = this.args.instructorGroup.title;
  });

  @action
  revertTitleChanges() {
    this.title = this.args.instructorGroup.title;
  }
}
