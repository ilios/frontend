import Component from '@glimmer/component';
import { service } from '@ember/service';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import pipe from 'ilios-common/helpers/pipe';

export default class SchoolLearningMaterialAttributesManager extends Component {
  @service intl;

  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="form" data-test-school-learning-material-attributes-manager ...attributes>
        <table class="ilios-table ilios-table-colors condensed">
          <thead>
            <tr>
              <th class="text-left">
                {{t "general.attribute"}}
              </th>
              <th class="text-left">
                {{t "general.enabled"}}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr data-test-accessibility-required>
              <td id="accessibility-required-{{templateId}}">
                {{t "general.accessibilityRequired"}}
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={{@accessibilityRequired}}
                  {{on "click" @toggle}}
                  aria-labelledby="accessibility-required-{{templateId}}"
                />
              </td>
            </tr>
            <tr data-test-accessibility-required-message>
              <td id="accessibility-required-message-{{templateId}}">
                {{t "general.accessibilityRequiredMessage"}}
              </td>
              <td>
                <input
                  type="text"
                  value={{@accessibilityRequiredMessage}}
                  {{on "input" (pick "target.value" (pipe @update))}}
                  aria-labelledby="accessibility-required-message-{{templateId}}"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    {{/let}}
  </template>
}
