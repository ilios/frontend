import Component from '@glimmer/component';
import { validatable, IsInt, Gt, Lte, NotBlank } from 'ilios-common/decorators/validation';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { action } from '@ember/object';

@validatable
export default class LearnerGroupNewMultipleComponent extends Component {
  @tracked @IsInt() @Gt(0) @NotBlank() @Lte(50) numberOfGroups;
  @tracked fillWithCohort = false;

  @dropTask
  *save() {
    this.addErrorDisplayFor('numberOfGroups');
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('numberOfGroups');
    yield this.args.generateNewLearnerGroups(this.numberOfGroups);
  }

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
