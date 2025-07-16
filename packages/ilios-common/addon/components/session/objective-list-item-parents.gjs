import Component from '@glimmer/component';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import FadeText from 'ilios-common/components/fade-text';
import onResize from 'ember-on-resize-modifier/modifiers/on-resize';

export default class SessionObjectiveListItemParentsComponent extends Component {
  get parents() {
    return this.args.parents
      .slice()
      .sort(sortableByPosition)
      .map((t) => t.title);
  }
  <template>
    <div
      class="session-objective-list-item-parents grid-item"
      data-test-objective-list-item-parents
    >
      {{#if @isManaging}}
        <button
          type="button"
          class="bigadd"
          {{on "click" @save}}
          disabled={{@isSaving}}
          aria-label={{t "general.save"}}
          data-test-save
        >
          {{#if @isSaving}}
            <FaIcon @icon="spinner" @spin={{true}} />
          {{else}}
            <FaIcon @icon="check" />
          {{/if}}
        </button>
        <button
          type="button"
          class="bigcancel"
          {{on "click" @cancel}}
          aria-label={{t "general.cancel"}}
          data-test-cancel
        >
          <FaIcon @icon="arrow-rotate-left" />
        </button>
      {{else}}
        {{#if @parents}}
          <FadeText
            @text={{this.parents}}
            @expanded={{@fadeTextExpanded}}
            @onExpandAll={{@onExpandAllFadeText}}
            as |displayText expand collapse updateTextDims shouldFade expanded|
          >
            {{#if @editable}}
              <span data-test-parent>
                <button
                  type="button"
                  class="link-button"
                  aria-label={{t "general.edit"}}
                  title={{t "general.edit"}}
                  {{on "click" @manage}}
                  data-test-manage
                >
                  <div class="display-text-wrapper{{if shouldFade ' faded'}}">
                    <div class="display-text" {{onResize updateTextDims}}>
                      {{displayText}}
                    </div>
                  </div>
                  {{#if @showIcon}}
                    <FaIcon data-test-edit-icon @icon="pen-to-square" class="enabled" />
                  {{/if}}
                </button>
              </span>
            {{else}}
              <span data-test-parent>
                <div class="display-text-wrapper{{if shouldFade ' faded'}}">
                  <div class="display-text" {{onResize updateTextDims}}>
                    {{displayText}}
                  </div>
                </div>
              </span>
            {{/if}}
            {{#if shouldFade}}
              <div
                class="fade-text-control"
                data-test-fade-text-control
                {{! template-lint-disable no-invalid-interactive}}
                {{on "click" @manage}}
              >
                <button
                  class="expand-text-button"
                  type="button"
                  title={{t "general.expand"}}
                  data-test-expand
                  {{on "click" expand}}
                >
                  <FaIcon @icon="angles-down" />
                </button>
              </div>
            {{else}}
              {{#if expanded}}
                <button
                  class="collapse-text-button"
                  title={{t "general.collapse"}}
                  type="button"
                  data-test-collapse
                  {{on "click" collapse}}
                >
                  <FaIcon @icon="angles-up" />
                </button>
              {{/if}}
            {{/if}}
          </FadeText>
        {{else}}
          {{#if @editable}}
            <button type="button" {{on "click" @manage}} data-test-manage>
              {{t "general.addNew"}}
            </button>
          {{else}}
            {{t "general.none"}}
          {{/if}}
        {{/if}}
      {{/if}}
    </div>
  </template>
}
