import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolNewVocabularyFormComponent extends Component {
  @service intl;
  @service store;
  @tracked title;

  validations = new YupValidations(this, {
    title: string()
      .required()
      .max(200)
      .test(
        'is-title-unique',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.exclusion',
          };
        },
        (value) => value == null || !this.existingTitles.includes(value),
      ),
  });

  @cached
  get schoolVocabulariesData() {
    return new TrackedAsyncData(this.args.school.vocabularies);
  }

  get existingTitles() {
    if (!this.schoolVocabulariesData.isResolved) {
      return [];
    }
    return this.schoolVocabulariesData.value.map(({ title }) => title);
  }

  saveNew = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    await this.args.save.linked().perform(this.title, this.args.school, true);
    this.validations.clearErrorDisplay();
  });

  saveOrCancel = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.saveNew.perform();
      return;
    }
    if (27 === keyCode) {
      this.args.close();
    }
  });
}

{{#let (unique-id) as |templateId|}}
  <div class="school-new-vocabulary-form" data-test-school-new-vocabulary-form ...attributes>
    <div class="form">
      <div class="item" data-test-title>
        <label for="title-{{templateId}}">
          {{t "general.title"}}:
        </label>
        <input
          id="title-{{templateId}}"
          type="text"
          value={{this.title}}
          {{on "input" (pick "target.value" (set this "title"))}}
          {{on "keyup" (perform this.saveOrCancel)}}
          {{this.validations.attach "title"}}
        />
        <YupValidationMessage
          @description={{t "general.vocabulary"}}
          @validationErrors={{this.validations.errors.title}}
          data-test-title-validation-error-message
        />
      </div>
      <div class="buttons">
        <button
          type="button"
          class="done text"
          data-test-submit
          {{on "click" (perform this.saveNew)}}
        >
          {{#if this.saveNew.isRunning}}
            <LoadingSpinner />
          {{else}}
            {{t "general.done"}}
          {{/if}}
        </button>
        <button type="button" class="cancel text" {{on "click" @close}} data-test-cancel>
          {{t "general.cancel"}}
        </button>
      </div>
    </div>
  </div>
{{/let}}