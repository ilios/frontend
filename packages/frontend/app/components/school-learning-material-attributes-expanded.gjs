import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { capitalize } from '@ember/string';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import perform from 'ember-concurrency/helpers/perform';
import { fn } from '@ember/helper';
import SchoolLearningMaterialAttributesManager from 'frontend/components/school-learning-material-attributes-manager';
import {
  faArrowRotateLeft,
  faCaretDown,
  faCheck,
  faSpinner,
  faBan,
} from '@fortawesome/free-solid-svg-icons';

export default class SchoolLearningMaterialAttributesExpandedComponent extends Component {
  @tracked flippedLearningMaterialAccessibilityRequired = false;
  @tracked learningMaterialAccessibilityRequiredMessage =
    this.args.learningMaterialAccessibilityRequiredMessage || '';

  get learningMaterialAccessibilityRequired() {
    if (this.flippedLearningMaterialAccessibilityRequired) {
      return !this.args.learningMaterialAccessibilityRequired;
    }
    return this.args.learningMaterialAccessibilityRequired;
  }

  resetFlipped() {
    this.flippedLearningMaterialAccessibilityRequired = false;
  }

  @action
  cancel() {
    this.args.manage(false);
    this.resetFlipped();
  }

  @action
  updateLearningMaterialRequiredMessage(msg) {
    this.learningMaterialAccessibilityRequiredMessage = msg;
  }

  @action
  enableLearningMaterialAttributeConfig(name) {
    const bufferName = 'flipped' + capitalize(name);
    this[bufferName] = !this.args[name];
  }

  @action
  disableLearningMaterialAttributeConfig(name) {
    const bufferName = 'flipped' + capitalize(name);
    this[bufferName] = this.args[name];
  }

  save = task({ drop: true }, async () => {
    //read the flipped values before we reset them
    const all = {
      learningMaterialAccessibilityRequired: this.learningMaterialAccessibilityRequired,
      learningMaterialAccessibilityRequiredMessage: `"${this.learningMaterialAccessibilityRequiredMessage}"`, //make sure text is in quotes so db value is valid
    };
    this.resetFlipped(); //reset before we save, otherwise there will be a flash of the old values
    await this.args.saveAll(all);
  });
  <template>
    <section
      class="school-learning-material-attributes-expanded"
      data-test-school-learning-material-attributes-expanded
      ...attributes
    >
      <div class="school-learning-material-attributes-expanded-header">
        {{#if @isManaging}}
          <div class="title" data-test-title>
            {{t "general.learningMaterialAttributes"}}
          </div>
        {{else}}
          <button
            class="title link-button"
            type="button"
            aria-expanded="true"
            data-test-title
            {{on "click" @collapse}}
          >
            {{t "general.learningMaterialAttributes"}}
            <FaIcon @icon={{faCaretDown}} />
          </button>
        {{/if}}
        <div class="actions">
          {{#if @isManaging}}
            <button
              type="button"
              class="bigadd"
              aria-label={{t "general.save"}}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              <FaIcon
                @icon={{if this.save.isRunning faSpinner faCheck}}
                @spin={{this.save.isRunning}}
              />
            </button>
            <button
              type="button"
              class="bigcancel"
              aria-label={{t "general.cancel"}}
              {{on "click" this.cancel}}
              data-test-cancel
            >
              <FaIcon @icon={{faArrowRotateLeft}} />
            </button>
          {{else if @canUpdate}}
            <button type="button" {{on "click" (fn @manage true)}} data-test-manage>
              {{t "general.manageLearningMaterialAttributes"}}
            </button>
          {{/if}}
        </div>
      </div>
      <div class="school-learning-material-attributes-expanded-content" data-test-expanded>
        {{#if @isManaging}}
          <SchoolLearningMaterialAttributesManager
            @learningMaterialAccessibilityRequired={{this.learningMaterialAccessibilityRequired}}
            @learningMaterialAccessibilityRequiredMessage={{@learningMaterialAccessibilityRequiredMessage}}
            @enable={{this.enableLearningMaterialAttributeConfig}}
            @disable={{this.disableLearningMaterialAttributeConfig}}
            @update={{this.updateLearningMaterialRequiredMessage}}
          />
        {{else}}
          <table class="ilios-table ilios-table-colors" data-test-attributes>
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
                <td>
                  {{t "general.accessibilityRequired"}}
                </td>
                <td>
                  <FaIcon
                    @icon={{if this.learningMaterialAccessibilityRequired faCheck faBan}}
                    class={{if this.learningMaterialAccessibilityRequired "yes" "no"}}
                  />
                </td>
              </tr>
              <tr data-test-accessibility-required-message>
                <td>
                  {{t "general.accessibilityRequiredMessage"}}
                </td>
                <td>
                  <span>
                    {{@learningMaterialAccessibilityRequiredMessage}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        {{/if}}
      </div>
    </section>
  </template>
}
