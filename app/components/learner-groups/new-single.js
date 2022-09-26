import Component from '@glimmer/component';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';

@validatable
export default class NewSingleLearnerGroupComponent extends Component {
  @tracked @Length(3, 60) @NotBlank() title;
  @tracked fillWithCohort = false;

  save = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    return this.args.save(this.title, this.fillWithCohort);
  });

  @action
  async keyboard({ keyCode }) {
    if (13 === keyCode) {
      await this.save.perform();
      return;
    }

    if (27 === keyCode) {
      this.args.cancel();
    }
  }
}
