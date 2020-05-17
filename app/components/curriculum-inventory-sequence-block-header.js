import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency-decorators';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class CurriculumInventorySequenceBlockHeader extends Component {
  @service store;
  @tracked @NotBlank() @Length(3, 200) title;

  @action
  load(element, [ sequenceBlock ]) {
    this.title = sequenceBlock.title;
  }

  @action
  revertTitleChanges() {
    this.title = this.args.sequenceBlock.title;
  }

  @restartableTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.sequenceBlock.title = this.title;
    yield this.args.sequenceBlock.save();
  }
}

