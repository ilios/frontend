import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import pick from 'ilios-common/helpers/pick';
import pipe from 'ilios-common/helpers/pipe';
import { string } from 'yup';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';

const DEFAULT_URL_VALUE = 'https://';

export default class SchoolLearningMaterialAttributesManager extends Component {
  @service intl;

  @tracked accessibilityRequirementsLink = this.args.accessibilityRequirementsLink || '';
  @tracked accessibilityRequirementsLinkChanged = false;

  validations = new YupValidations(this, {
    accessibilityRequirementsLink: string().ensure().trim().max(2000).url(),
  });

  get bestUrl() {
    if (this.accessibilityRequirementsLink || this.accessibilityRequirementsLinkChanged) {
      return this.accessibilityRequirementsLink;
    }

    return DEFAULT_URL_VALUE;
  }

  @action
  selectAllText({ target }) {
    if (target.value === DEFAULT_URL_VALUE) {
      target.select();
    }
  }

  @action
  changeURL(value) {
    // console.log('changeUrl', value);
    this.validations.addErrorDisplayFor('accessibilityRequirementsLink');
    value = value.trim();
    const regex = RegExp('https://http[s]?:');
    if (regex.test(value)) {
      value = value.substring(8);
    }
    this.accessibilityRequirementsLink = value;
    this.accessibilityRequirementsLinkChanged = true;
  }

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
            <tr data-test-accessibility-requirements-link>
              <td id="accessibility-requirements-link-{{templateId}}">
                {{t "general.accessibilityRequirementsLink"}}
              </td>
              <td>
                {{! template-lint-disable no-bare-strings}}
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={{this.bestUrl}}
                  inputmode="url"
                  {{on "input" (pick "target.value" this.changeUrl)}}
                  {{on "focus" this.selectAllText}}
                  {{on "keydown" (pick "target.value" (pipe @update))}}
                  aria-labelledby="accessibility-requirements-link-{{templateId}}"
                  {{this.validations.attach "accessibilityRequirementsLink"}}
                />
                <YupValidationMessage
                  @description={{t "general.accessibilityRequirementsLink"}}
                  @validationErrors={{this.validations.errors.accessibilityRequirementsLink}}
                  data-test-accessibility-requirements-link-validation-error-message
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    {{/let}}
  </template>
}
