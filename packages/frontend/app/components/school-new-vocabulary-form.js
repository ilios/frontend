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
