import Component from '@glimmer/component';
import { createPopper } from '@popperjs/core';
import { modifier } from 'ember-modifier';

export default class IliosTooltipComponent extends Component {
  get applicationElement() {
    return document.querySelector('.ember-application');
  }

  popperTooltip = modifier(function popperTooltip(element, [target, options]) {
    if (!target) {
      return;
    }

    const popper = createPopper(target, element, options);

    return () => {
      popper.destroy();
    };
  });
  <template>
    {{#in-element this.applicationElement insertBefore=null}}
      <div class="ilios-tooltip" {{this.popperTooltip @target @options}} ...attributes>
        <div class="content">
          <div class="arrow" data-popper-arrow></div>
          {{#if @title}}
            <div class="title">
              {{@title}}
            </div>
          {{/if}}
          <div class="body">
            {{yield}}
          </div>
        </div>
      </div>
    {{/in-element}}
  </template>
}
