import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

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
}
