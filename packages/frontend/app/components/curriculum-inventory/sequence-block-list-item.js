import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

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
