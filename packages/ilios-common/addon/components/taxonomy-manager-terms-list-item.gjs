import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { on } from '@ember/modifier';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';

export default class SelectableTermsListItemComponent extends Component {
  @tracked isHovering;

  get termsListItemButtonId() {
    return `taxonomy-manager-terms-list-item-button-${guidFor(this)}`;
  }

  get termsListItemButtonElement() {
    return document.getElementById(this.termsListItemButtonId);
  }

  get isSelected() {
    const term = this.args.term;
    const selectedTerms = this.args.selectedTerms;
    return selectedTerms.includes(term);
  }

  get level() {
    return this.args.level ?? 0;
  }

  get showTooltip() {
    return this.args?.term.description?.length && this.isHovering;
  }

  @action
  click() {
    if (this.isSelected) {
      this.args.remove(this.args.term);
    } else {
      this.args.add(this.args.term);
    }
  }
  <template>
    <button
      class="taxonomy-manager-terms-list-item {{if this.isSelected 'selected'}}"
      type="button"
      data-test-taxonomy-manager-terms-list-item
      data-test-taxonomy-manager-terms-list-item-level={{this.level}}
      {{on "click" this.click}}
      {{mouseHoverToggle (set this "isHovering")}}
      id={{this.termsListItemButtonId}}
    >
      {{#if this.showTooltip}}
        <IliosTooltip @target={{this.termsListItemButtonElement}}>
          {{@term.description}}
        </IliosTooltip>
      {{/if}}
      <span data-test-title>{{@term.title}}</span>
      <span class="actions">
        {{#if this.isSelected}}
          <FaIcon @icon={{faXmark}} />
        {{else}}
          <FaIcon @icon={{faPlus}} class="add" />
        {{/if}}
      </span>
    </button>
  </template>
}
