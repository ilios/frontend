import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import { eq } from 'ember-truth-helpers';
import { guidFor } from '@ember/object/internals';
import focus from 'ilios-common/modifiers/focus';
import mouseHoverToggle from 'ilios-common/modifiers/mouse-hover-toggle';
import IliosTooltip from 'ilios-common/components/ilios-tooltip';

export default class DownloadDropdownComponent extends Component {
  @tracked showTooltip = false;

  popperOptions = {
    placement: 'right',
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom'],
        },
      },
    ],
  };

  get dropdownItemId() {
    return `dropdown-item-${guidFor(this)}`;
  }

  get dropdownItemElement() {
    return document.getElementById(this.dropdownItemId);
  }

  @action
  toggleTooltip() {
    this.showTooltip = !this.showTooltip;
  }

  @action
  moveFocus(event) {
    const { key, target } = event;
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        if (target.nextElementSibling) {
          target.nextElementSibling.focus();
        } else {
          target.parentElement.firstElementChild.focus();
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (target.previousElementSibling) {
          target.previousElementSibling.focus();
        } else {
          target.parentElement.lastElementChild.focus();
        }
        break;
      case 'Escape':
      case 'Tab':
      case 'ArrowRight':
      case 'ArrowLeft':
        this.args.closeMenu();
        break;
    }
  }

  <template>
    <button
      type="button"
      class="dropdown-item"
      id={{this.dropdownItemId}}
      role="menuitem"
      tabindex="-1"
      data-level="item"
      data-test-item
      {{on "click" (fn @action @item.filename)}}
      {{on "keydown" this.moveFocus}}
      {{mouseHoverToggle this.toggleTooltip}}
      {{focus (eq @index 0)}}
    >
      {{@item.title}}
    </button>
    {{#if this.showTooltip}}
      <IliosTooltip
        @target={{this.dropdownItemElement}}
        @options={{this.popperOptions}}
        class="dropdown-item-tooltip"
      >
        {{@item.tooltip}}
      </IliosTooltip>
    {{/if}}
  </template>
}
