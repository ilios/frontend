import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

export default class ToggleButtons extends Component {
  get uniqueId() {
    return guidFor(this);
  }

  @action
  firstChoice() {
    if (!this.args.firstOptionSelected) {
      this.args.toggle(true);
    }
  }

  @action
  secondChoice() {
    if (this.args.firstOptionSelected) {
      this.args.toggle(false);
    }
  }
}

<span class="toggle-buttons" data-test-toggle-buttons ...attributes>
  <input
    type="radio"
    id={{concat "first-toggle-" this.uniqueId}}
    name={{concat "toggle-" this.uniqueId}}
    checked={{eq @firstOptionSelected true}}
    data-test-first-input
    {{on "click" this.firstChoice}}
  />
  <label for={{concat "first-toggle-" this.uniqueId}} data-test-first-label>
    {{@firstLabel}}
  </label>
  <input
    type="radio"
    id={{concat "second-toggle-" this.uniqueId}}
    name={{concat "toggle-" this.uniqueId}}
    checked={{eq @firstOptionSelected false}}
    data-test-second-input
    {{on "click" this.secondChoice}}
  />
  <label for={{concat "second-toggle-" this.uniqueId}} data-test-second-label>
    {{@secondLabel}}
  </label>
</span>