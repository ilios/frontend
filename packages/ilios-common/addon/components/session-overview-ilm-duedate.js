import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { validatable, NotBlank } from 'ilios-common/decorators/validation';
import { dropTask } from 'ember-concurrency';
import moment from 'moment';

@validatable
export default class SessionOverviewIlmDuedateComponent extends Component {
  @tracked @NotBlank() dueDate = this.args.ilmSession?.dueDate;

  @action
  revert() {
    this.dueDate = this.args.ilmSession.dueDate;
  }

  @action
  updateDate(date) {
    const currentDueDate = moment(this.dueDate);
    this.dueDate = moment(date)
      .hour(currentDueDate.hour())
      .minute(currentDueDate.minute())
      .toDate();
  }

  @action
  updateTime(value, type) {
    const dueDate = moment(this.dueDate);
    if (type === 'hour') {
      dueDate.hour(value);
    } else {
      dueDate.minute(value);
    }
    this.dueDate = dueDate.toDate();
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
