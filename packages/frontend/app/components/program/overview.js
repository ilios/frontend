import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class ProgramOverviewComponent extends Component {
  id = guidFor(this);
  @tracked duration;
  @tracked shortTitle;

  constructor() {
    super(...arguments);
    this.duration = this.args.program.duration;
    this.shortTitle = this.args.program.shortTitle;
  }

  validations = new YupValidations(this, {
    shortTitle: string().required().min(2).max(10),
  });

  changeShortTitle = dropTask(async () => {
    if (this.shortTitle !== this.args.program.shortTitle) {
      this.validations.addErrorDisplayForAllFields();
      const isValid = await this.validations.isValid();
      if (!isValid) {
        return false;
      }
      this.validations.clearErrorDisplay();
      this.args.program.set('shortTitle', this.shortTitle);
      await this.args.program.save();
      this.shortTitle = this.args.program.shortTitle;
    }
  });

  changeDuration = dropTask(async () => {
    if (this.duration !== this.args.program.duration) {
      this.args.program.set('duration', this.duration);
      await this.args.program.save();
      this.duration = this.args.program.duration;
    }
  });

  @action
  setDuration(ev) {
    this.duration = Number(ev.target.value);
  }
}
