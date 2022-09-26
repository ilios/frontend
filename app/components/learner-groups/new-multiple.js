import Component from '@glimmer/component';
import { validatable, IsInt, Gt, Lte, NotBlank } from 'ilios-common/decorators/validation';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';

@validatable
export default class NewMultipleLearnerGroupComponent extends Component {
  @tracked @IsInt() @Gt(0) @NotBlank() @Lte(50) numberOfGroups;
  @tracked fillWithCohort = false;

  save = dropTask(async () => {
    this.addErrorDisplayFor('numberOfGroups');
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('numberOfGroups');
    await this.args.generateNewLearnerGroups(this.numberOfGroups);
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
