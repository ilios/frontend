import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { validatable, Length } from 'ilios-common/decorators/validation';

@validatable
export default class ReportsSubjectHeader extends Component {
  @tracked @Length(1, 240) title = '';

  changeTitle = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.report.title = this.title;
    await this.args.report.save();
  });

  @action
  revertTitleChanges() {
    this.title = this.reportTitle;
  }
}
