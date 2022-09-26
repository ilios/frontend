import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class CurriculumInventorySequenceBlockHeaderComponent extends Component {
  @service store;
  @tracked @NotBlank() @Length(3, 200) title;

  @action
  load(element, [sequenceBlock]) {
    this.title = sequenceBlock.title;
  }

  @action
  revertTitleChanges() {
    this.title = this.args.sequenceBlock.title;
  }

  changeTitle = restartableTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.sequenceBlock.title = this.title;
    await this.args.sequenceBlock.save();
  });
}
