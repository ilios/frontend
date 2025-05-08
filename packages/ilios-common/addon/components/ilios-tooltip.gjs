import Component from '@glimmer/component';
import popperTooltip from 'ember-popper-modifier/modifiers/popper-tooltip';

export default class TooltipComponent extends Component {
  get applicationElement() {
    return document.querySelector('.ember-application');
  }
  <template>
    {{#in-element this.applicationElement insertBefore=null}}
      <div class="ilios-tooltip" {{popperTooltip @target}} ...attributes>
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
