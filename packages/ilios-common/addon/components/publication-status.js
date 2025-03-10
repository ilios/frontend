import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';

export default class ProgressBarComponent extends Component {
  id = guidFor(this);
  get textKey() {
    if (this.args.item.isScheduled) {
      return 'general.scheduled';
    }
    if (this.args.item.isPublished) {
      return 'general.published';
    }

    return 'general.notPublished';
  }

  get iconKey() {
    if (this.args.item.isScheduled) {
      return 'clock';
    }
    if (this.args.item.isPublished) {
      return 'star';
    }

    return 'star-half-stroke';
  }

  get publicationStatus() {
    if (this.args.item.isScheduled) {
      return 'scheduled';
    } else if (this.args.item.isPublished) {
      return 'published';
    }

    return 'notpublished';
  }
}
