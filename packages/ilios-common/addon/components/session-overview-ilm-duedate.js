import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validatable, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';
import { DateTime } from 'luxon';

@validatable
export default class SessionOverviewIlmDuedateComponent extends Component {
  @tracked @NotBlank() dueDate = this.args.ilmSession?.dueDate;

  @action
  revert() {
    this.dueDate = this.args.ilmSession.dueDate;
  }

  @action
  updateDate(date) {
    const currentDueDate = DateTime.fromJSDate(this.dueDate);
    this.dueDate = DateTime.fromJSDate(date)
      .set({
        hour: currentDueDate.hour,
        minute: currentDueDate.minute,
      })
      .toJSDate();
  }

  @action
  updateTime(value, type) {
    const update = 'hour' === type ? { hour: value } : { minute: value };
    this.dueDate = DateTime.fromJSDate(this.dueDate).set(update).toJSDate();
  }

  save = dropTask(async () => {
    this.addErrorDisplayFor('dueDate');
    const isValid = await this.isValid('dueDate');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('dueDate');
    this.args.ilmSession.dueDate = this.dueDate;
    await this.args.ilmSession.save();
  });
}
