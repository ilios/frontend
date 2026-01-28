import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import { faClock, faStar, faStarHalfStroke } from '@fortawesome/free-solid-svg-icons';

export default class PublicationStatusComponent extends Component {
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
      return faClock;
    }
    if (this.args.item.isPublished) {
      return faStar;
    }

    return faStarHalfStroke;
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
      {{#if @showText}}
        <FaIcon
          @icon={{this.iconKey}}
          @ariaLabeledBy="{{this.id}}-title"
          class="icon"
          data-test-icon
        />
        <span id="{{this.id}}-title" class="text" data-test-text>{{t this.textKey}}</span>
      {{else}}
        <FaIcon @icon={{this.iconKey}} class="icon" data-test-icon @title={{t this.textKey}} />
      {{/if}}
    </span>
  </template>
}
