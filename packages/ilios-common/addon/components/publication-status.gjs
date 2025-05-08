import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';

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
  <template>
    <span
      class="status publication-status {{this.publicationStatus}}"
      ...attributes
      data-test-publication-status
    >
      <FaIcon
        @icon={{this.iconKey}}
        @ariaLabeledBy="{{this.id}}-title"
        class="icon"
        data-test-icon
      />
      <span id="{{this.id}}-title" class="text" data-test-text>{{t this.textKey}}</span>
    </span>
  </template>
}
