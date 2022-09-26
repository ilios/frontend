import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class LearnergroupHeaderComponent extends Component {
  @tracked @NotBlank() @Length(3, 60) title;

  @action
  load() {
    this.title = this.args.learnerGroup.title;
  }

  @action
  revertTitleChanges() {
    this.title = this.args.learnerGroup.title;
  }

  changeTitle = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.learnerGroup.title = this.title;
    await this.args.learnerGroup.save();
  });
}
