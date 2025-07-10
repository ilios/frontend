import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';
import { on } from '@ember/modifier';
import { fn, concat } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';
import set from 'ember-set-helper/helpers/set';
import { LinkTo } from '@ember/routing';
import perform from 'ember-concurrency/helpers/perform';

export default class SchoolSessionTypesListItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  remove = dropTask(async () => {
    await this.args.sessionType.destroyRecord();
  });
  <template>
    <tr
      class="school-session-types-list-item"
      data-test-school-session-types-list-item
      ...attributes
    >
      <td colspan="3" data-test-title>
        <button
          class="link-button"
          type="button"
          {{on "click" (fn @manageSessionType @sessionType.id)}}
        >
          {{@sessionType.title}}
        </button>
        {{#unless @sessionType.active}}
          <em data-test-inactive>
            ({{t "general.inactive"}})
          </em>
        {{/unless}}
      </td>
      <td class="hide-from-small-screen" data-test-sessions-count>
        {{@sessionType.sessionCount}}
      </td>
      <td data-test-is-assessment>
        {{#if @sessionType.assessment}}
          <FaIcon @icon="check" class="yes" />
        {{else}}
          <FaIcon @icon="ban" class="no" />
        {{/if}}
      </td>
      <td class="hide-from-small-screen" colspan="2" data-test-assessment-option>
        {{@sessionType.assessmentOption.name}}
      </td>
      <td class="hide-from-small-screen" colspan="2" data-test-assessment-method-description>
        {{@sessionType.firstAamcMethod.description}}

        {{#if (and @sessionType.firstAamcMethod (not @sessionType.firstAamcMethod.active))}}
          <em>
            ({{t "general.inactive"}})
          </em>
        {{/if}}
      </td>
      <td class="calendar-color hide-from-small-screen">
        {{! template-lint-disable no-inline-styles style-concatenation no-triple-curlies}}
        <span
          class="box"
          data-test-colorbox
          style={{{concat "background-color: " @sessionType.safeCalendarColor}}}
        ></span>
      </td>
      <td>
        <button
          type="button"
          class="link-button"
          aria-label={{t "general.manage"}}
          data-test-manage
          {{on "click" (fn @manageSessionType @sessionType.id)}}
        >
          <FaIcon @icon="pen-to-square" class="edit" />
        </button>
        {{#if (eq @sessionType.sessionCount 0)}}
          {{#if @canDelete}}
            <button
              type="button"
              class="link-button"
              aria-label={{t "general.remove"}}
              disabled={{or (this.showRemoveConfirmation this.deleteSessionType.isRunning)}}
              data-test-delete
              {{on "click" (set this "showRemoveConfirmation" true)}}
            >
              <FaIcon
                @icon="trash"
                class={{if
                  (or this.showRemoveConfirmation this.deleteSessionType.isRunning)
                  "inactive"
                  "remove"
                }}
              />
            </button>
          {{/if}}
        {{else}}
          <FaIcon @icon="trash" class="disabled" />
        {{/if}}
        <LinkTo @route="session-type-visualize-vocabularies" @model={{@sessionType}}>
          <FaIcon @icon="chart-column" class="enabled" @title={{t "general.vocabularies"}} />
        </LinkTo>
      </td>
    </tr>
    {{#if this.showRemoveConfirmation}}
      <tr class="confirm-removal">
        <td colspan="11" class="hide-from-small-screen">
          <div class="confirm-message" data-test-message>
            {{t "general.sessionTypeConfirmRemoval"}}
            <br />
            <div class="confirm-buttons">
              <button
                type="button"
                class="remove text"
                {{on "click" (perform this.remove)}}
                data-test-confirm
              >
                {{t "general.yes"}}
              </button>
              <button
                type="button"
                class="done text"
                {{on "click" (set this "showRemoveConfirmation" false)}}
                data-test-cancel
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        </td>
        <td colspan="5" class="hide-from-large-screen" data-test-confirm-removal>
          <div class="confirm-message" data-test-message>
            {{t "general.sessionTypeConfirmRemoval"}}
            <br />
            <div class="confirm-buttons">
              <button
                type="button"
                class="remove text"
                {{on "click" (perform this.remove)}}
                data-test-confirm
              >
                {{t "general.yes"}}
              </button>
              <button
                type="button"
                class="done text"
                {{on "click" (set this "showRemoveConfirmation" false)}}
                data-test-cancel
              >
                {{t "general.cancel"}}
              </button>
            </div>
          </div>
        </td>
      </tr>
    {{/if}}
  </template>
}
