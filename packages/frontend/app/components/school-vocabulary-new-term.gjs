import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';

export default class SchoolVocabularyNewTermComponent extends Component {
  @service store;
  @service intl;
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

  save = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    await this.args.createTerm(this.title);
    this.title = null;
  });

  saveOnEnter = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.save.perform();
    }
  });

  @cached
  get getTermData() {
    return new TrackedAsyncData(
      this.args.term ? this.args.term.children : this.args.vocabulary.getTopLevelTerms(),
    );
  }

  get existingTitles() {
    return this.getTermData.isResolved ? this.getTermData.value.map(({ title }) => title) : [];
  }
  <template>
    <div class="school-vocabulary-new-term" data-test-school-vocabulary-new-term>
      <input
        aria-label={{t "general.title"}}
        type="text"
        value={{this.title}}
        disabled={{this.save.isRunning}}
        {{on "input" (pick "target.value" (set this "title"))}}
        {{on "keyup" (perform this.saveOnEnter)}}
        {{this.validations.attach "title"}}
      />
      <button
        type="button"
        class="save text"
        disabled={{this.save.isRunning}}
        {{on "click" (perform this.save)}}
      >
        {{#if this.save.isRunning}}
          <LoadingSpinner />
        {{else}}
          {{t "general.add"}}
        {{/if}}
      </button>
      <YupValidationMessage
        @description={{t "general.term"}}
        @validationErrors={{this.validations.errors.title}}
        data-test-title-validation-error-message
      />
    </div>
  </template>
}
