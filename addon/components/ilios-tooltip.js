import Component from '@glimmer/component';
import { action } from '@ember/object';
import { createPopper } from '@popperjs/core';

export default class TooltipComponent extends Component {
  _popper = null;

  @action
  setup(element) {
    this._popper = createPopper(
      this.args.target,
      element,
      this.args.options ?? {}
    );
  }

  get applicationElement() {
    return document.querySelector('.ember-application');
  }

  willDestroy() {
    if (this._popper) {
      this._popper.destroy();
    }
  }
}
