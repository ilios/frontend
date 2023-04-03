import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class CurriculumInventorySequenceBlockListItemComponent extends Component {
  @service intl;
  @tracked showConfirmRemoval;

  @use course = new ResolveAsyncValue(() => [this.args.sequenceBlock.course]);

  get courseTitle() {
    if (this.course) {
      return this.course.title;
    }
    return this.intl.t('general.notApplicableAbbr');
  }
}
