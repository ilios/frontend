import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';
import { validatable, Length } from 'ilios-common/decorators/validation';
import { guidFor } from '@ember/object/internals';

@validatable
export default class ProgramOverviewComponent extends Component {
  id = guidFor(this);
  @tracked duration = this.args.program.duration;
  @Length(2, 10) @tracked shortTitle = this.args.program.shortTitle;

  @dropTask
  *changeShortTitle() {
    if (this.shortTitle !== this.args.program.shortTitle) {
      this.addErrorDisplayFor('shortTitle');
      const isValid = yield this.isValid('shortTitle');
      if (!isValid) {
        return false;
      }
      this.args.program.set('shortTitle', this.shortTitle);
      yield this.args.program.save();
      this.shortTitle = this.args.program.shortTitle;
      this.removeErrorDisplayFor('shortTitle');
    }
  }

  @dropTask
  *changeDuration() {
    if (this.duration !== this.args.program.duration) {
      this.args.program.set('duration', this.duration);
      yield this.args.program.save();
      this.duration = this.args.program.duration;
    }
  }

  @action
  setDuration(value) {
    this.duration = Number(value);
  }
}
