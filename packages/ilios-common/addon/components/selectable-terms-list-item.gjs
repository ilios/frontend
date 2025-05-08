import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';

export default class SelectableTermsListItem extends Component {
  @tracked isHovering;

  get selectableTermsListItemButtonId() {
    return `selectable-terms-list-item-button-${guidFor(this)}`;
  }

  get selectableTermsListItemButtonElement() {
    return document.getElementById(this.selectableTermsListItemButtonId);
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
}

<button
  class="selectable-terms-list-item {{if this.isSelected 'selected'}}"
  type="button"
  data-test-selectable-terms-list-item
  data-test-selectable-terms-list-item-level={{this.level}}
  {{on "click" this.click}}
  {{mouse-hover-toggle (set this "isHovering")}}
  id={{this.selectableTermsListItemButtonId}}
>
  {{#if this.showTooltip}}
    <IliosTooltip @target={{this.selectableTermsListItemButtonElement}}>
      {{@term.description}}
    </IliosTooltip>
  {{/if}}
  <span data-test-title>{{@term.title}}</span>
  <span class="actions">
    {{#if this.isSelected}}
      <FaIcon @icon="xmark" />
    {{else}}
      <FaIcon @icon="plus" class="add" />
    {{/if}}
  </span>
</button>