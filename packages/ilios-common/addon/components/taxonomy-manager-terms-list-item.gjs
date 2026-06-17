import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { and, or } from 'ember-truth-helpers';

export default class SelectableTermsListItemComponent extends Component {
  @tracked isHovering;

  get termsListItemId() {
    return `taxonomy-manager-terms-list-item-button-${guidFor(this)}`;
  }

  get termsListItemElement() {
    return document.getElementById(this.termsListItemId);
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
    {{#if (or this.isSelected (and @hasActiveParent @term.active))}}
      <button
        class="taxonomy-manager-terms-list-item taxonomy-manager-terms-list-item-button
          {{if this.isSelected 'selected'}}"
        type="button"
        data-test-taxonomy-manager-terms-list-item
        data-test-taxonomy-manager-terms-list-item-level={{this.level}}
        {{on "click" this.click}}
        {{mouseHoverToggle (set this "isHovering")}}
        id={{this.termsListItemId}}
      >
        {{#if this.showTooltip}}
          <IliosTooltip @target={{this.termsListItemElement}}>
            {{@term.description}}
          </IliosTooltip>
        {{/if}}
        <span data-test-title>{{@term.title}}</span>
        {{#unless @term.active}}
          <span class="inactive" data-test-inactive>
            ({{t "general.inactive"}})
          </span>
        {{/unless}}
        <span class="actions">
          {{#if this.isSelected}}
            <FaIcon @icon={{faXmark}} data-test-remove />
          {{else}}
            <FaIcon @icon={{faPlus}} class="add" data-test-add />
          {{/if}}
        </span>
      </button>
    {{else}}
      <div
        class="taxonomy-manager-terms-list-item {{if this.isSelected 'selected'}}"
        data-test-taxonomy-manager-terms-list-item
        data-test-taxonomy-manager-terms-list-item-level={{this.level}}
        {{mouseHoverToggle (set this "isHovering")}}
        id={{this.termsListItemId}}
      >
        {{#if this.showTooltip}}
          <IliosTooltip @target={{this.termsListItemElement}}>
            {{@term.description}}
          </IliosTooltip>
        {{/if}}
        <span data-test-title>
          {{@term.title}}
        </span>
        {{#unless @term.active}}
          <span class="inactive" data-test-inactive>
            ({{t "general.inactive"}})
          </span>
        {{/unless}}
      </div>
    {{/if}}
  </template>
}
