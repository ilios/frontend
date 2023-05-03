import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class CurriculumInventorySequenceBlockListItemComponent extends Component {
  @service intl;
  @tracked showConfirmRemoval;

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.sequenceBlock.course);
  }

  get course() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get courseTitle() {
    if (this.course) {
      return this.course.title;
    }
    return this.intl.t('general.notApplicableAbbr');
  }
}
