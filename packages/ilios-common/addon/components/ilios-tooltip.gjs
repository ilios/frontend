import Component from '@glimmer/component';

export default class TooltipComponent extends Component {
  get applicationElement() {
    return document.querySelector('.ember-application');
  }
}

{{#in-element this.applicationElement insertBefore=null}}
  <div class="ilios-tooltip" {{popper-tooltip @target}} ...attributes>
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